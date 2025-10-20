import { Link } from "react-router-dom";

function LoginSelection() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <h1 className="text-4xl font-bold text-white mb-8">
        Attendance Management System
      </h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
        <h2 className="text-2xl mb-6 font-semibold text-gray-700">Login As</h2>
        <Link to="/employee-login">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-4">
            Employee Login
          </button>
        </Link>
        <Link to="/admin-login">
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
}
export default LoginSelection;