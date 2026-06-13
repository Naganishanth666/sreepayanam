const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const Package = require('../models/Package');

const IMAGE_PRESETS = {
  'Family Tours': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484712401471-05c7215830eb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'
  ],
  'Pilgrimage Tours': [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561361068-61998aaf687b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600100397608-f010e42ec9a4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507721999472-8ed4421c4b2e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
  ],
  'Honeymoon Tours': [
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505080856163-267d49b302c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  ],
  'Hill Station Tours': [
    'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532300481631-0bc14f3b7699?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
  ],
  'Resort Packages': [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473116763269-255448993767?auto=format&fit=crop&w=800&q=80'
  ],
  'Weekend Tours': [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab07e5e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
  ],
  'Group Tours': [
    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80'
  ],
  'School / College Tours': [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566121318570-5db60f38d356?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'
  ],
  'Corporate Tours': [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
  ],
  'Festival Tours': [
    'https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605335198089-a20c3848b5ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'
  ],
  'Cultural Tours': [
    'https://images.unsplash.com/photo-1600100397608-f010e42ec9a4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561361068-61998aaf687b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565192647048-f997ded8797e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566121318570-5db60f38d356?auto=format&fit=crop&w=800&q=80'
  ],
  'Medical Tours': [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
  ],
  'Event / Sports Tours': [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1471295263379-6cd96c1f03d5?auto=format&fit=crop&w=800&q=80'
  ],
  'Cruise Packages': [
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505080856163-267d49b302c4?auto=format&fit=crop&w=800&q=80'
  ],
  'Luxury Tours': [
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  ],
  'Budget Tours': [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1474487548417-781f71495f3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565123409695-7b5ff624d164?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=800&q=80'
  ],
  'MICE Tours': [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  ],
  'Education Tours': [
    'https://images.unsplash.com/photo-1566121318570-5db60f38d356?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=800&q=80'
  ],
  'Adventure Tours': [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526481280693-3bfa756150f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  ]
};

const getRandomPresetImage = (tourType) => {
  const presets = IMAGE_PRESETS[tourType] || IMAGE_PRESETS['Family Tours'] || [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
  ];
  const idx = Math.floor(Math.random() * presets.length);
  return presets[idx];
};


// Helper to initialize OpenAI client
const getOpenAIClient = (res) => {
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ message: 'OpenAI API key is not configured in .env' });
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// 1. AI Customized Tour Assistant & Planner (B2C Customers)
router.post('/plan', async (req, res) => {
  try {
    const { prompt } = req.body;
    const openai = getOpenAIClient(res);
    if (!openai) return;

    // Fetch available packages to provide context
    const packages = await Package.find({ isActive: true }).select('title destination durationDays durationNights price offerPrice highlights tourType');
    
    const contextPrompt = `
      You are an expert AI Travel Planner & Assistant for "SreePayanam Tours & Travels".
      The user wants to plan a trip with this request: "${prompt}".
      
      Here are our currently active tour packages (in JSON format):
      ${JSON.stringify(packages)}
      
      Instructions:
      1. Carefully match the user's request against our available packages.
      2. If one or more packages are a good match, showcase them enthusiastically with pricing (₹), duration, and highlight features. Let them know they can click on "Packages" in the navigation bar to see full details.
      3. If no package is a perfect match, perform thorough, realistic travel research and suggest a beautiful custom day-by-day itinerary matching their desires. For each day, you MUST explicitly detail:
         - 🏨 **Suggested Hotel:** Recommend a specific realistic local hotel or resort (along with its star rating/luxury tier).
         - 🍽️ **Meal & Cuisine:** Suggest authentic dining options, restaurants, or local cuisines to try (e.g. Traditional Sadya, Mandi, local seafood).
         - ✈️🚗 **Suggested Travel & Transit:** Provide concrete travel suggestions (e.g., flight routing/airlines, train options, or car transfers with driving distances and driving durations).
         Tell the user they can instantly book these options by submitting the Enquiry Form or pinging us on WhatsApp (+91 94432 17654).
      4. Keep your tone extremely friendly, inspiring, and professional. Use Markdown format (bullet points, bold text, emojis) for readability. Do not expose raw JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional travel planning expert for SreePayanam Tours & Travels.' },
        { role: 'user', content: contextPrompt }
      ],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('AI Plan Error:', error);
    res.status(500).json({ message: 'Error communicating with AI assistant' });
  }
});

// 2. AI Package Content Generator (For Admin Dashboard)
router.post('/generate-package', async (req, res) => {
  try {
    const { prompt } = req.body;
    const openai = getOpenAIClient(res);
    if (!openai) return;

    const generatorPrompt = `
      Create a fully written, highly professional travel package matching the following prompt: "${prompt}".
      
      You MUST perform thorough, realistic travel research to provide real suggested travel, flight transfers, train numbers or schedules, driving durations/distances, and genuine hotel and meal recommendations.
      
      Your response MUST be a valid JSON object ONLY. Do not write any markdown wrappers (like \`\`\`json), explanations, or trailing characters.
      
      The JSON object MUST strictly conform to the following schema:
      {
        "title": "Inspiring and premium package title",
        "destination": "Name of destination (e.g. Kerala, India or Paris, France)",
        "packageCategory": "National" | "International",
        "tourType": "Family Tours" | "Pilgrimage Tours" | "Honeymoon Tours" | "Hill Station Tours" | "Resort Packages" | "Weekend Tours" | "Group Tours" | "School / College Tours" | "Corporate Tours" | "Festival Tours" | "Cultural Tours" | "Medical Tours" | "Event / Sports Tours" | "Cruise Packages" | "MICE Tours" | "Education Tours" | "Luxury Tours" | "Budget Tours" | "Adventure Tours",
        "startingCity": "E.g. Chennai",
        "endingCity": "E.g. Kochi",
        "durationDays": 5,
        "durationNights": 4,
        "overview": "Thorough, engaging, premium paragraph describing the package experience.",
        "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "itinerary": [
          {
            "day": 1,
            "title": "Arrival & Backwaters Cruise",
            "activities": "Detailed description of activities for this day.",
            "hotel": "Name of a specific realistic premium hotel or resort matching the location",
            "mealPlan": "Breakfast (Include specific local dishes, cuisines, or restaurants suggested)",
            "transport": "Specific flight details (airlines, routes), train options, or car travel/road transfers, with transit times and distance"
          }
        ],
        "inclusions": "Separate each inclusion item with a newline character. Example: Daily Buffet Breakfast\\nPremium Deluxe AC Room\\nSightseeing in AC Sedan\\nAll entry permits",
        "exclusions": "Separate each exclusion item with a newline character. Example: Flight Tickets\\nPersonal Laundry & Beverages\\nTravel Insurance\\nAny optional upgrades",
        "optionalAddons": "Separate each addon with a newline. Example: Ayurvedic Spa Package\\nHouseboat Night stay upgrade",
        "originalPrice": 45000,
        "offerPrice": 39999,
        "isSpecialOffer": true,
        "termsAndConditions": "Standard package booking terms, advance payments, and document needs.",
        "cancellationPolicy": "Cancellation timeline: 30 days prior: 100% refund, 15 days prior: 50% refund, less than 7 days: no refund.",
        "seoTitle": "Premium SEO optimized title (max 60 chars)",
        "seoMetaDescription": "Captivating meta description for Google search (max 155 chars)"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an API that only returns pure, valid, parsed JSON conforming to the requested schema. Never output markdown format.' },
        { role: 'user', content: generatorPrompt }
      ],
      temperature: 0.7,
    });

    const cleanJsonText = completion.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const packageData = JSON.parse(cleanJsonText);
    
    // Assign a beautiful preset image if imageUrl is empty or a generic placeholder
    if (!packageData.imageUrl || packageData.imageUrl.includes('photo-1507525428034') || packageData.imageUrl.includes('photo-1469854523086')) {
      packageData.imageUrl = getRandomPresetImage(packageData.tourType);
    }
    
    res.json(packageData);

  } catch (error) {
    console.error('AI Generator Error:', error);
    res.status(500).json({ message: 'AI failed to generate package content. Please try a different prompt.' });
  }
});

// 3. Customer Support AI Chatbot (Interactive widget)
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const openai = getOpenAIClient(res);
    if (!openai) return;

    // Fetch active packages for chatbot reference
    const packages = await Package.find({ isActive: true }).select('title destination durationDays price tourType');

    const systemPrompt = `
      You are the official Customer Support Chatbot for "SreePayanam Tours & Travels".
      Your goals:
      - Cheerfully help visitors find the perfect tour package.
      - Gather contact/enquiry details (Name, Phone, Travel Destination) and let them know we'll contact them immediately.
      - Explain our booking process (browse packages, select one, hit "Request Callback" or book directly).
      - Provide our company's Bank Details for offline payments/transfers:
        * Account Name: SreePayanam Tours & Travels
        * Bank Name: State Bank of India (SBI)
        * Branch: Chennai Main Branch
        * Account Number: 41234567890
        * IFSC Code: SBIN0000001
        * UPI ID: sreepayanam@sbi
      - Support multilingual chats (answer in English, Tamil, Hindi, Malayalam, Telugu, Kannada, or Arabic if the customer initiates in those languages).
      
      Here is the list of our current packages:
      ${JSON.stringify(packages)}
      
      Be warm, polite, direct, and structured. Always recommend SreePayanam! Keep answers relatively concise so they look good in a chat widget.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Error processing your chat' });
  }
});

// 4. CRM AI Lead Scoring (For CRM Panel)
router.post('/score-lead', async (req, res) => {
  try {
    const { enquiry } = req.body;
    const openai = getOpenAIClient(res);
    if (!openai) return;

    const leadPrompt = `
      Analyze this customer enquiry and perform AI Lead Scoring and Follow-up Recommendation:
      
      Enquiry details:
      - Customer Name: ${enquiry.customerName}
      - Mobile: ${enquiry.mobileNumber}
      - Travel Date: ${enquiry.travelDate || 'Not specified'}
      - Return Date: ${enquiry.returnDate || 'Not specified'}
      - Number of Passengers: ${enquiry.numberOfPassengers || 1}
      - Enquiry Type: ${enquiry.enquiryType || 'General'}
      - From Location: ${enquiry.fromLocation || 'Not specified'}
      - To Location: ${enquiry.toLocation || 'Not specified'}
      - Hotel Check-in: ${enquiry.hotelCheckIn || 'Not specified'}
      - Hotel Check-out: ${enquiry.hotelCheckOut || 'Not specified'}
      - Rooms: ${enquiry.hotelRooms || 'Not specified'}
      - Hotel Category: ${enquiry.hotelCategory || 'Not specified'}
      - Flight Type: ${enquiry.flightType || 'Not specified'}
      - Flight Class: ${enquiry.flightClass || 'Not specified'}
      - Train Class: ${enquiry.trainClass || 'Not specified'}
      - Car Type: ${enquiry.carType || 'Not specified'}
      - Car Driver Option: ${enquiry.carDriverOption || 'Not specified'}
      - Remarks/Requests: ${enquiry.remarks || 'None'}
      
      Output ONLY a JSON response matching the following schema:
      {
        "score": "Hot" | "Warm" | "Cold",
        "urgency": "High" | "Medium" | "Low",
        "reasoning": "Brief explanation of why this score was given.",
        "suggestedAction": "Immediate specific follow-up action for the team.",
        "followUpMessage": "A friendly personalized follow-up WhatsApp/SMS draft ready to send."
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI Sales Coach and CRM Optimizer that evaluates travel leads.' },
        { role: 'user', content: leadPrompt }
      ],
    });

    const cleanJsonText = completion.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    res.json(JSON.parse(cleanJsonText));
  } catch (error) {
    console.error('AI Lead Scoring Error:', error);
    res.status(500).json({ message: 'Lead scoring error' });
  }
});

// 5. Suggest Options for Flights, Hotels, Trains, and Car Rentals
router.post('/suggest-options', async (req, res) => {
  try {
    const {
      category,
      destination,
      startingCity,
      endingCity,
      durationDays,
      durationNights,
      hotelCategory,
      flightClass,
      flightCarrier,
      trainClass,
      carType,
      driverOption,
      customPrompt
    } = req.body;

    const openai = getOpenAIClient(res);
    if (!openai) return;

    const systemPrompt = `
      You are an expert AI Travel Pricing & Recommendations Engine for "SreePayanam Tours & Travels".
      Your goal is to suggest the absolute best, highly realistic travel options across 4 categories: Hotels, Flights, Trains, and Rental Cars.
      
      User Request details:
      - Requested Service Category: ${category || 'all'}
      - Destination: ${destination || 'Not specified'}
      - Starting City: ${startingCity || 'Not specified'}
      - Ending City: ${endingCity || 'Not specified'}
      - Duration: ${durationDays ? durationDays + ' Days / ' + durationNights + ' Nights' : 'Not specified'}
      - Hotel Preference: ${hotelCategory || 'Not specified'}
      - Flight Class Preference: ${flightClass || 'Not specified'}
      - Flight Carrier Preference: ${flightCarrier || 'Not specified'}
      - Train Class Preference: ${trainClass || 'Not specified'}
      - Car Type Preference: ${carType || 'Not specified'}
      - Driver Option: ${driverOption || 'Not specified'}
      - Extra instructions: ${customPrompt || 'None'}

      Instructions:
      1. Perform thorough, realistic travel research to provide real suggested local hotels, existing flight paths/schedules (e.g. Indigo, Air India, Emirates), genuine train connections (e.g. specific train numbers/names in India), and car rental styles.
      2. You MUST suggest exactly 5 options for each category (hotels, flights, trains, cars) that match the requested parameters.
      3. For any category that is NOT requested or applicable, you should STILL generate 5 realistic options to give a complete travel choice, but prioritize categories matches.
      4. Ensure prices are in Indian Rupees (₹) and ratings/times are concrete and highly accurate.
      5. The output MUST be a valid JSON object ONLY. Do not write any markdown wrappers (like \`\`\`json), explanations, or trailing characters.

      The JSON object MUST strictly conform to the following schema:
      {
        "hotels": [
          {
            "id": 1,
            "name": "E.g. Grand Hyatt Kochi Bolgatty",
            "rating": "E.g. 5 Star",
            "price": "E.g. ₹12,500/night",
            "description": "Engaging 1-2 sentence description highlighting the stay experience.",
            "amenities": ["Spa", "Pool", "Free WiFi"],
            "matchReason": "Why this matches their requirements specifically."
          }
        ],
        "flights": [
          {
            "id": 1,
            "airline": "E.g. IndiGo (6E-651)",
            "route": "E.g. Chennai (MAA) to Kochi (COK)",
            "schedule": "E.g. 08:15 AM - 09:35 AM",
            "duration": "E.g. 1h 20m",
            "price": "E.g. ₹3,400",
            "class": "Economy",
            "matchReason": "Why this flight is a great match (e.g., direct flight, best timing)."
          }
        ],
        "trains": [
          {
            "id": 1,
            "name": "E.g. Trivandrum Mail (12623)",
            "route": "E.g. Chennai Central (MAS) to Ernakulam (ERS)",
            "schedule": "E.g. 07:45 PM - 06:40 AM (Overnight)",
            "duration": "E.g. 10h 55m",
            "price": "E.g. ₹1,250",
            "class": "AC 3 Tier (3A)",
            "matchReason": "Why this train fits their itinerary."
          }
        ],
        "cars": [
          {
            "id": 1,
            "type": "E.g. SUV (Toyota Innova Crysta)",
            "operator": "E.g. SreePayanam Chauffeur Services",
            "features": "E.g. AC, Spacious 7-seater, Carrier",
            "rate": "E.g. ₹3,500/day",
            "driverOption": "Chauffeur-Driven",
            "matchReason": "Why this car type is ideal for this route."
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an API that only returns pure, valid, parsed JSON conforming to the requested schema. Never output markdown format.' },
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0.7,
    });

    const cleanJsonText = completion.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    res.json(JSON.parse(cleanJsonText));
  } catch (error) {
    console.error('AI Suggest Options Error:', error);
    res.status(500).json({ message: 'AI failed to generate travel suggestions. Please check parameters and try again.' });
  }
});

// 6. Compile Draft from Chosen Options
router.post('/compile-draft', async (req, res) => {
  try {
    const {
      destination,
      startingCity,
      endingCity,
      durationDays,
      durationNights,
      packageCategory,
      tourType,
      selectedHotel,
      selectedFlight,
      selectedTrain,
      selectedCar,
      customPrompt
    } = req.body;

    const openai = getOpenAIClient(res);
    if (!openai) return;

    const compilePrompt = `
      Create a fully written, highly professional travel package matching the following details.
      
      You MUST integrate the Admin's explicitly SELECTED choices for flights, hotels, trains, and transfers directly into the package structure and day-by-day itinerary descriptions.
      
      Selected Choices to incorporate:
      - Selected Hotel Choice: ${selectedHotel ? JSON.stringify(selectedHotel) : 'None'}
      - Selected Flight Choice: ${selectedFlight ? JSON.stringify(selectedFlight) : 'None'}
      - Selected Train Choice: ${selectedTrain ? JSON.stringify(selectedTrain) : 'None'}
      - Selected Car/Transfer Choice: ${selectedCar ? JSON.stringify(selectedCar) : 'None'}
      
      Package Parameters:
      - Destination: ${destination}
      - Starting City: ${startingCity || 'Not specified'}
      - Ending City: ${endingCity || 'Not specified'}
      - Duration: ${durationDays} Days / ${durationNights} Nights
      - Package Category: ${packageCategory || 'National'}
      - Tour Type: ${tourType || 'Family Tours'}
      - Additional Prompt Details: ${customPrompt || 'None'}

      Instructions for Itinerary Compilation:
      - Make sure the day-wise itinerary explicitly mentions the selected hotel (e.g. staying at "${selectedHotel?.name || 'Grand Hyatt'}") for overnight stays.
      - Day 1 (Arrival) should explicitly detail the flight ("${selectedFlight?.airline || 'IndiGo flight'}") or train ("${selectedTrain?.name || 'Trivandrum Mail'}") details.
      - Transfers and excursions should explicitly mention using the selected vehicle ("${selectedCar?.type || 'AC Sedan'} operated by ${selectedCar?.operator || 'private driver'}").
      
      Your response MUST be a valid JSON object ONLY. Do not write any markdown wrappers (like \`\`\`json), explanations, or trailing characters.
      
      The JSON object MUST strictly conform to the following schema:
      {
        "title": "Inspiring and premium package title incorporating selected elements",
        "destination": "${destination}",
        "packageCategory": "${packageCategory || 'National'}",
        "tourType": "${tourType || 'Family Tours'}",
        "startingCity": "${startingCity}",
        "endingCity": "${endingCity}",
        "durationDays": ${Number(durationDays)},
        "durationNights": ${Number(durationNights)},
        "overview": "Thorough, engaging, premium paragraph describing the package experience incorporating the selected stays and transits.",
        "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "itinerary": [
          {
            "day": 1,
            "title": "Arrival & Welcome",
            "activities": "Detailed description of activities for this day.",
            "hotel": "${selectedHotel?.name || 'Selected Premium Stay'}",
            "mealPlan": "Breakfast (Mention local items or hotel dining)",
            "transport": "Transit detail using selected flights/trains and selected vehicle"
          }
        ],
        "inclusions": "Separate each inclusion item with a newline character. Example: Daily Buffet Breakfast\\nStay at ${selectedHotel?.name || 'Premium Room'}\\nTransit in AC ${selectedCar?.type || 'Sedan'}\\nAll entry permits",
        "exclusions": "Separate each exclusion item with a newline character. Example: Flight Tickets\\nPersonal Laundry & Beverages\\nTravel Insurance",
        "optionalAddons": "Separate each addon with a newline. Example: Ayurvedic Spa Package\\nUpgrade to premium cottage",
        "originalPrice": 45000,
        "offerPrice": 39999,
        "isSpecialOffer": true,
        "termsAndConditions": "Standard package booking terms, advance payments, and document needs.",
        "cancellationPolicy": "Cancellation timeline: 30 days prior: 100% refund, 15 days prior: 50% refund, less than 7 days: no refund.",
        "seoTitle": "Premium SEO optimized title (max 60 chars)",
        "seoMetaDescription": "Captivating meta description for Google search (max 155 chars)"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an API that only returns pure, valid, parsed JSON conforming to the requested schema. Never output markdown format.' },
        { role: 'user', content: compilePrompt }
      ],
      temperature: 0.7,
    });

    const cleanJsonText = completion.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const packageData = JSON.parse(cleanJsonText);
    
    // Assign a beautiful preset image if imageUrl is empty or a generic placeholder
    if (!packageData.imageUrl || packageData.imageUrl.includes('photo-1507525428034') || packageData.imageUrl.includes('photo-1469854523086')) {
      packageData.imageUrl = getRandomPresetImage(packageData.tourType || tourType);
    }
    
    res.json(packageData);

  } catch (error) {
    console.error('AI Compile Draft Error:', error);
    res.status(500).json({ message: 'AI failed to compile package draft. Please try again.' });
  }
});

module.exports = router;
