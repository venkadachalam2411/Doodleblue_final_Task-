
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>

      {items.map((item, index) => (
        <span className="breadcrumb-item" key={index}>
          <ChevronRight size={15} />

          {item.path && index !== items.length - 1 ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
