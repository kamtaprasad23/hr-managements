import { Link } from "react-router-dom";

function LoginSelection() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-x">
      <div className="flex text-center text-2xl md:text-4xl">
       <h1 className="font-bold text-white mb-10 drop-shadow-lg">
        HR - Management System
      </h1>
     </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-80 text-center transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-2xl mb-6 font-semibold text-gray-700">Login As</h2>

        <Link to="/employee-login">
          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all mb-5">
            Employee Login
          </button>
        </Link>

        <Link to="/admin-login">
          <button className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-3 rounded-xl hover:from-green-500 hover:to-teal-600 shadow-lg transition-all">
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
}

export default LoginSelection;
