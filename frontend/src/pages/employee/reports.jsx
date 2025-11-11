import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/employee.reports.css";

export default function ReportsPage() {
  const token = localStorage.getItem("token");
  const mainCategories = ["technologies", "projects", "companies", "patents", "publications", "employees"];

  const [mainCategory, setMainCategory] = useState("technologies");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalRows, setTotalRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFilters({});
    setPage(1);
    setResults([]);
    setTotalRows(null);
    setError(null);
  }, [mainCategory]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
    setResults([]);
    setTotalRows(null);
    setError(null);
  };

  const buildParams = () => {
    const p = { category: mainCategory, page, limit };
    const copyFields = ["keyword","status","tech_stack","tech_id","country","type","role","designation","department","year","start_date","end_date"];
    copyFields.forEach(f => { if(filters[f] !== undefined && filters[f] !== "") p[f] = filters[f]; });

    if(filters.startDate) p.start_date = filters.startDate;
    if(filters.endDate) p.end_date = filters.endDate;
    if(filters.yearFiled) p.year_filed = filters.yearFiled;
    if(filters.yearGranted) p.year_granted = filters.yearGranted;
    if(filters.yearFrom) p.year_from = filters.yearFrom;
    if(filters.yearTo) p.year_to = filters.yearTo;
    if(filters.budgetMin) p.budget_min = filters.budgetMin;
    if(filters.budgetMax) p.budget_max = filters.budgetMax;
    if(filters.productionStartFrom) p.production_start_from = filters.productionStartFrom;
    if(filters.productionStartTo) p.production_start_to = filters.productionStartTo;
    if(filters.trl_min) p.trl_min = filters.trl_min;
    if(filters.trl_max) p.trl_max = filters.trl_max;

    return p;
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      const res = await axios.get("http://localhost:5000/api/reports", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data?.data || []);
      setTotalRows(res.data?.total ?? null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to fetch reports");
      setResults([]);
    } finally { setLoading(false); }
  };

  const exportToExcel = () => {
    if (!results.length) return alert("No data to export!");
    import("xlsx").then((XLSX) => {
      const ws = XLSX.utils.json_to_sheet(results);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reports");
      XLSX.writeFile(wb, `reports_${mainCategory}.xlsx`);
    });
  };

  const exportToCSV = () => {
    if (!results.length) return alert("No data to export!");
    const header = Object.keys(results[0]).join(",");
    const rows = results.map(r => Object.values(r).map(v => `"${(v ?? "").toString().replace(/"/g,'""')}"`).join(","));
    const csv = [header,...rows].join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`reports_${mainCategory}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!results.length) return alert("No data to export!");
    const doc = new jsPDF({ orientation:"landscape" });
    doc.setFontSize(14);
    doc.text(`Reports Export — ${mainCategory}`, 14, 15);
    autoTable(doc,{
      head:[Object.keys(results[0])],
      body:results.map(r=>Object.values(r)),
      startY:25,
      theme:"grid",
      styles:{fontSize:8}
    });
    doc.save(`reports_${mainCategory}.pdf`);
  };

  const renderSubFilters = () => {
    switch(mainCategory){
      case "technologies": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <input placeholder="Tech Stack" value={filters.tech_stack||""} onChange={e=>handleFilterChange("tech_stack",e.target.value)}/>
        <select value={filters.status||""} onChange={e=>handleFilterChange("status",e.target.value)}>
          <option value="">All Status</option><option value="In Development">In Development</option><option value="In Use">In Use</option><option value="Deprecated">Deprecated</option>
        </select>
        <input type="date" value={filters.productionStartFrom||""} onChange={e=>handleFilterChange("productionStartFrom",e.target.value)}/>
        <input type="date" value={filters.productionStartTo||""} onChange={e=>handleFilterChange("productionStartTo",e.target.value)}/>
        <input type="number" placeholder="TRL min" value={filters.trl_min||""} onChange={e=>handleFilterChange("trl_min",e.target.value)}/>
        <input type="number" placeholder="TRL max" value={filters.trl_max||""} onChange={e=>handleFilterChange("trl_max",e.target.value)}/>
        <input type="number" placeholder="Budget min" value={filters.budgetMin||""} onChange={e=>handleFilterChange("budgetMin",e.target.value)}/>
        <input type="number" placeholder="Budget max" value={filters.budgetMax||""} onChange={e=>handleFilterChange("budgetMax",e.target.value)}/>
      </>);
      case "projects": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <input type="number" placeholder="Tech ID" value={filters.tech_id||""} onChange={e=>handleFilterChange("tech_id",e.target.value)}/>
        <input type="date" value={filters.startDate||""} onChange={e=>handleFilterChange("startDate",e.target.value)}/>
        <input type="date" value={filters.endDate||""} onChange={e=>handleFilterChange("endDate",e.target.value)}/>
        <input type="number" placeholder="Budget min" value={filters.budgetMin||""} onChange={e=>handleFilterChange("budgetMin",e.target.value)}/>
        <input type="number" placeholder="Budget max" value={filters.budgetMax||""} onChange={e=>handleFilterChange("budgetMax",e.target.value)}/>
      </>);
      case "companies": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <select value={filters.type||""} onChange={e=>handleFilterChange("type",e.target.value)}>
          <option value="">All Types</option><option value="Private">Private</option><option value="Government">Government</option><option value="Academic">Academic</option><option value="NGO">NGO</option><option value="Startup">Startup</option>
        </select>
        <input placeholder="Country" value={filters.country||""} onChange={e=>handleFilterChange("country",e.target.value)}/>
      </>);
      case "patents": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <input type="number" placeholder="Tech ID" value={filters.tech_id||""} onChange={e=>handleFilterChange("tech_id",e.target.value)}/>
        <input type="date" placeholder="Filed from" value={filters.date_filed_from||""} onChange={e=>handleFilterChange("date_filed_from",e.target.value)}/>
        <input type="date" placeholder="Filed to" value={filters.date_filed_to||""} onChange={e=>handleFilterChange("date_filed_to",e.target.value)}/>
        <input type="date" placeholder="Granted from" value={filters.date_granted_from||""} onChange={e=>handleFilterChange("date_granted_from",e.target.value)}/>
        <input type="date" placeholder="Granted to" value={filters.date_granted_to||""} onChange={e=>handleFilterChange("date_granted_to",e.target.value)}/>
      </>);
      case "publications": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <input type="number" placeholder="Tech ID" value={filters.tech_id||""} onChange={e=>handleFilterChange("tech_id",e.target.value)}/>
        <input type="number" placeholder="Year" value={filters.year||""} onChange={e=>handleFilterChange("year",e.target.value)}/>
      </>);
      case "employees": return (<>
        <input placeholder="🔎 Keyword" value={filters.keyword||""} onChange={e=>handleFilterChange("keyword",e.target.value)}/>
        <input placeholder="Designation" value={filters.designation||""} onChange={e=>handleFilterChange("designation",e.target.value)}/>
        <select value={filters.status||""} onChange={e=>handleFilterChange("status",e.target.value)}>
          <option value="">All Status</option><option value="Active">Active</option><option value="On Leave">On Leave</option><option value="Retired">Retired</option>
        </select>
      </>);
      default: return null;
    }
  };

  const pretty = k => k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());

  return (
    <div className="rpt-section">
      <h2>REPORTS</h2>
      <p>Generate or download analytics and performance reports here.</p>

      <div className="rpt-filters-panel">
        <select value={mainCategory} onChange={e=>setMainCategory(e.target.value)} className="rpt-category-select">
          {mainCategories.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </select>
        <div className="rpt-subfilters">{renderSubFilters()}</div>
        <div className="rpt-filter-buttons">
          <button className="rpt-btn pill" onClick={fetchReports} disabled={loading}>Apply</button>
          <button className="rpt-btn pill reset" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : <>
        {error && <p className="rpt-error">{error}</p>}
        <div className="rpt-export-buttons">
          <button className="rpt-btn pill" onClick={exportToExcel} disabled={!results.length}>Excel</button>
          <button className="rpt-btn pill" onClick={exportToCSV} disabled={!results.length}>CSV</button>
          <button className="rpt-btn pill" onClick={exportToPDF} disabled={!results.length}>PDF</button>
        </div>

        {results.length === 0 ? <p>No data found.</p> : (
          <div className="rpt-results">
            <table className="rpt-table">
              <thead>
                <tr>{Object.keys(results[0]).map(key=><th key={key}>{pretty(key)}</th>)}</tr>
              </thead>
              <tbody>
                {results.map((row,i)=><tr key={i}>{Object.values(row).map((v,j)=><td key={j}>{v??"—"}</td>)}</tr>)}
              </tbody>
            </table>

            <div className="rpt-pagination">
              <button onClick={()=>{if(page>1){setPage(page-1);fetchReports();}}} disabled={page===1}>Prev</button>
              <span>Page {page}</span>
              <button onClick={()=>{setPage(page+1);fetchReports();}}>Next</button>
              <select value={limit} onChange={e=>{setLimit(Number(e.target.value)); setPage(1);}}>
                {[10,25,50,100].map(n=><option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        )}
      </>}
    </div>
  );
}
