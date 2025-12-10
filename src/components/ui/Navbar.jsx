import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flex gap-4">
      <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">
        Home
      </Link>
      <Link to="/create" className="text-gray-700 hover:text-gray-900 font-medium">
        Create Quiz
      </Link>
      <Link to="/explore" className="text-gray-700 hover:text-gray-900 font-medium">
        Explore
      </Link>
      <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
        Dashboard
      </Link>
    </nav>
  );
}

export default Navbar;
