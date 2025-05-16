import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-br from-sky-100 to-indigo-100">
      <header className="mb-12 animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-extrabold text-sky-700 mb-6 leading-tight">
          Welcome to <span className="text-indigo-600">EventBond</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Your central hub for discovering, booking, and managing memorable events. Dive in and explore what's happening!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl w-full mb-12">
        <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 animate-slideInUp aniamtion-delay-200">
          <h2 className="text-3xl font-semibold text-sky-600 mb-4">Explore Events</h2>
          <p className="text-gray-600 mb-6">
            Find concerts, workshops, meetups, and more. Your next adventure is just a click away.
          </p>
          <Link
            to="/events"
            className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Browse All Events
          </Link>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 animate-slideInUp animation-delay-400">
            <h2 className="text-3xl font-semibold text-emerald-600 mb-4">Join EventBond</h2>
            <p className="text-gray-600 mb-6">
              Sign up to book events, save your favorites, and get personalized recommendations.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Sign Up Now
            </Link>
          </div>
        ) : user?.role === 'admin' ? (
          <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 animate-slideInUp animation-delay-400">
            <h2 className="text-3xl font-semibold text-purple-600 mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Manage events, users, and site settings from the control panel.
            </p>
            <Link
              to="/admin"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 animate-slideInUp animation-delay-400">
            <h2 className="text-3xl font-semibold text-teal-600 mb-4">Your Bookings</h2>
            <p className="text-gray-600 mb-6">
              View and manage your upcoming event bookings and history.
            </p>
            <Link
              to="/bookings"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View My Bookings
            </Link>
          </div>
        )}
      </div>

      {isAuthenticated && user?.role !== 'admin' && (
        <div className="mt-8 animate-fadeIn animation-delay-600">
          <p className="text-gray-700">
            Looking to host your own event? Contact our admin team for more information.
          </p>
        </div>
      )}

    </div>
  );
};

export default HomePage;