import { useEffect, useState } from "react";
import API from "../../utils/api";

export default function AdminEmpReports() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    reportType: "attendance",
    dateType: "month",
    month: "",
    startDate: "",
    endDate: "",
    search: "",
    sort: "a-z",
  });

  useEffect(() => {
    fetchData();
  }, [filters.reportType]);

  async function fetchData() {
    try {
      let endpoint;
      switch (filters.reportType) {
        case "attendance":
          endpoint = "/attendance/all";
          break;
        case "employee":
          endpoint = "/admin/employees";
          break;
        case "salary":
          endpoint = "/salary";
          break;
        default:
          throw new Error("Invalid report type");
      }

      const res = await API.get(endpoint);
      let dataToProcess = [];
      if (filters.reportType === 'employee' && res.data.employees) {
        dataToProcess = res.data.employees;
      } else if (Array.isArray(res.data)) {
        dataToProcess = res.data;
      }

      setRecords(dataToProcess);
      applyFilters(dataToProcess);
    } catch (err) {
      setError(err.response?.data?.message || `Error fetching ${filters.reportType} data`);
      setFiltered([]);
    }
  }

  const applyFilters = (data) => {
    let filteredData = [...data];

    // Date Filter
    if (filters.dateType === "month" && filters.month) {
      const [year, monthNum] = filters.month.split("-");
      filteredData = filteredData.filter((r) => {
        const date = new Date(r.date || r.month);
        return date.getFullYear() === parseInt(year) && date.getMonth() + 1 === parseInt(monthNum);
      });
    } else if (filters.dateType === "range" && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filteredData = filteredData.filter((r) => {
        const date = new Date(r.date || r.month);
        return date >= start && date <= end;
      });
    }

    // Search Filter
    if (filters.search) {
      filteredData = filteredData.filter((r) =>
        (r.user?.name || r.name || "").toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Sort Filter
    filteredData.sort((a, b) => {
      const nameA = (a.user?.name || a.name || "").toLowerCase();
      const nameB = (b.user?.name || b.name || "").toLowerCase();
      return filters.sort === "a-z" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    setFiltered(filteredData);
    setError(filteredData.length === 0 ? "No records match the filters" : "");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "dateType") {
        newFilters.month = "";
        newFilters.startDate = "";
        newFilters.endDate = "";
      }
      return newFilters;
    });
  };

  const handleFilter = () => {
    if (filters.dateType === "month" && !filters.month) {
      setError("Please select a month");
      return;
    }
    if (filters.dateType === "range" && (!filters.startDate || !filters.endDate)) {
      setError("Please select both start and end dates");
      return;
    }
    applyFilters(records);
  };

  const downloadCSV = () => {
    if (filtered.length === 0) {
      setError("No data to download");
      return;
    }

    let headers, rows;
    switch (filters.reportType) {
      case "attendance":
        headers = ["Name,Email,Date,CheckIn,CheckOut,TotalHours"];
        rows = filtered.map((r) => {
          const name = r.user?.name || r.name || "";
          const email = r.user?.email || r.email || "";
          const date = new Date(r.date).toLocaleDateString();
          const checkIn = r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-";
          const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-";
          const hours = r.totalHours || "0";
          return `${name},${email},${date},${checkIn},${checkOut},${hours}`;
        });
        break;
      case "employee":
        headers = ["Name,Email,Phone,Position,Salary"];
        rows = filtered.map((r) => {
          const name = r.name || "";
          const email = r.email || "";
          const phone = r.phone || "";
          const position = r.position || "";
          const salary = r.salary || "-";
          return `${name},${email},${phone},${position},${salary}`;
        });
        break;
      case "salary":
        headers = ["Name,Email,Month,Amount,Status"];
        rows = filtered.map((r) => {
          const name = r.user?.name || r.name || "";
          const email = r.user?.email || r.email || "";
          const month = new Date(r.month).toLocaleDateString();
          const amount = r.amount || "0";
          const status = r.status || "-";
          return `${name},${email},${month},${amount},${status}`;
        });
        break;
      default:
        return;
    }

    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filters.reportType}_report_${filters.month || "range"}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Reports</h1>
      <p className=" mb-6">
        Filter and download reports for attendance, employees, or salaries.
      </p>
      {error && (
        <div className=" border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500  px-4 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6  p-4 rounded-lg shadow ">
        <select
          name="reportType"
          value={filters.reportType}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="attendance" className="bg-gray-400">Attendance</option>
          <option value="employee" className="bg-gray-400">Employee</option>
          <option value="salary" className="bg-gray-400">Salary</option>
        </select>

        <select
          name="dateType"
          value={filters.dateType}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="month"className="bg-gray-400">Month</option>
          <option value="range"className="bg-gray-400">Custom Range</option>
        </select>

        {filters.dateType === "month" ? (
          <input
            type="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="border p-2 rounded w-full md:w-1/4"
          />
        ) : (
          <>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full md:w-1/4"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full md:w-1/4"
            />
          </>
        )}

        <input
          type="text"
          name="search"
          placeholder="Search by name"
          value={filters.search}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full md:w-1/4"
        />

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full md:w-1/4 "
        >
          <option value="a-z"className="bg-gray-400">A-Z</option>
          <option value="z-a"className="bg-gray-400">Z-A</option>
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
        <button
          onClick={downloadCSV}
          disabled={filtered.length === 0}
          className={`px-4 py-2 rounded ${
            filtered.length === 0
              ? "bg-gray-300"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Download CSV
        </button>
      </div>

      <table className="w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-300 text-black">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            {filters.reportType === "attendance" && (
              <>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Check In</th>
                <th className="p-2 text-left">Check Out</th>
                <th className="p-2 text-left">Hours</th>
              </>
            )}
            {filters.reportType === "employee" && (
              <>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Salary</th>
              </>
            )}
            {filters.reportType === "salary" && (
              <>
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 ">{r.user?.name || r.name}</td>
                <td className="p-2">{r.user?.email || r.email}</td>
                {filters.reportType === "attendance" && (
                  <>
                    <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-2">
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                    </td>
                    <td className="p-2">
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                    </td>
                    <td className="p-2">{r.totalHours || "0"}</td>
                  </>
                )}
                {filters.reportType === "employee" && (
                  <>
                    <td className="p-2">{r.phone || "-"}</td>
                    <td className="p-2">{r.position || "-"}</td>
                    <td className="p-2">{r.salary || "-"}</td>
                  </>
                )}
                {filters.reportType === "salary" && (
                  <>
                    <td className="p-2">{new Date(r.month).toLocaleDateString()}</td>
                    <td className="p-2">{r.amount || "0"}</td>
                    <td className="p-2">{r.status || "-"}</td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={filters.reportType === "attendance" ? 6 : 5} className="text-center p-4">
                No records match the filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}