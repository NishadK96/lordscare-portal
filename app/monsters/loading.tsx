export default function MonstersLoading() {
  return <main className="monsters-page monster-loading-page"><div className="monster-loading-header" /><section className="monster-loading-hero" /><div className="support-shell monster-loading-content"><div className="monster-loading-search" /><div className="monster-loading-grid">{Array.from({ length: 8 }, (_, index) => <div className="monster-card-skeleton" key={index}><span /><i /><i /><b /></div>)}</div></div></main>;
}
