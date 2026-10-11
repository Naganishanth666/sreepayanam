import { languageLabels } from '../utils/catalogCategories';

const PackageLanguagePicker = ({ value, onChange }) => (
  <div role="group" aria-label="Package language" className="package-language-picker">
    {Object.entries(languageLabels).map(([code, label]) => (
      <button key={code} type="button" aria-pressed={value === code}
        className={value === code ? 'is-active' : ''} onClick={() => onChange(code)}>
        {label}
      </button>
    ))}
    <style>{`
      .package-language-picker{display:inline-flex;gap:4px;padding:4px;background:#eef2f8;border:1px solid #dbe3ee;border-radius:999px;max-width:100%;}
      .package-language-picker button{border:0;background:transparent;border-radius:999px;padding:8px 13px;color:#40516d;font:inherit;font-size:.84rem;font-weight:700;cursor:pointer;white-space:nowrap;}
      .package-language-picker button.is-active{background:#fff;color:#153d76;box-shadow:0 1px 5px #0f172a1a;}
      .package-language-picker button:focus-visible{outline:3px solid #f29b38;outline-offset:2px;}
    `}</style>
  </div>
);

export default PackageLanguagePicker;
