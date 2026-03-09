import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Hospital Management System</h1>
        <p className="text-gray-600 mb-6">Welcome to the HMS dashboard. Backend is connected via proxy.</p>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
            View Patients
          </button>
          <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
            Manage Appointments
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
