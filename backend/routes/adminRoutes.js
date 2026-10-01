const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { checkAdmin } = require('../middleware/auth');

const router = express.Router();

const ROLES = new Set(['Admin', 'Agent', 'Customer']);
const APPROVAL_FILTERS = new Set(['All', 'Pending', 'Approved']);
const MAX_PAGE = 10_000;
const MAX_LIMIT = 50;

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serialiseAccount = account => ({
  id: account._id,
  fullName: account.fullName,
  mobile: account.mobile,
  email: account.email,
  city: account.city || '',
  state: account.state || '',
  country: account.country || '',
  role: account.role,
  agencyName: account.agencyName || '',
  businessCategory: account.businessCategory || '',
  preferredTravelCategory: account.preferredTravelCategory || '',
  consentForAlerts: Boolean(account.consentForAlerts),
  isApproved: Boolean(account.isApproved),
  createdAt: account.createdAt
});

const buildQuery = ({ role, approval, search }) => {
  const clauses = [];

  if (role && ROLES.has(role)) {
    clauses.push({ role });
  }

  if (approval === 'Pending') {
    clauses.push({ role: 'Agent', isApproved: false });
  } else if (approval === 'Approved') {
    clauses.push({
      $or: [
        { role: { $ne: 'Agent' } },
        { role: 'Agent', isApproved: true }
      ]
    });
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search.slice(0, 80)), 'i');
    clauses.push({
      $or: [
        { fullName: pattern },
        { email: pattern },
        { mobile: pattern },
        { agencyName: pattern }
      ]
    });
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
};

// Account directory reads are admin-only and never return password hashes.
router.get('/users', checkAdmin, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, MAX_PAGE)
      : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
      : 20;
    const role = ROLES.has(req.query.role) ? req.query.role : '';
    const approval = APPROVAL_FILTERS.has(req.query.approval) ? req.query.approval : 'All';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const query = buildQuery({ role, approval, search });

    const [accounts, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return res.json({
      accounts: accounts.map(serialiseAccount),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (err) {
    console.error('[Admin] Account directory fetch failed:', err.message);
    return res.status(500).json({ message: 'Could not load accounts.' });
  }
});

// Agent approval is intentionally the only account mutation exposed here.
// Role changes and account deletion require a separate business policy.
router.patch('/users/:id/approval', checkAdmin, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (typeof req.body?.approved !== 'boolean') {
      return res.status(400).json({ message: 'Approval must be true or false.' });
    }

    const account = await User.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    if (account.role !== 'Agent') {
      return res.status(400).json({ message: 'Only agent accounts have an approval status.' });
    }

    account.isApproved = req.body.approved;
    await account.save();

    return res.json({
      message: req.body.approved ? 'Agent account approved.' : 'Agent approval revoked.',
      account: serialiseAccount(account)
    });
  } catch (err) {
    console.error('[Admin] Account approval update failed:', err.message);
    return res.status(500).json({ message: 'Could not update the account approval.' });
  }
});

module.exports = router;
