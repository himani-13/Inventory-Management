import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.logo}>
        Smart Inventory
      </div>

      <div style={styles.menu}>
        <NavLink to="/" end style={navStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/risk" style={navStyle}>
          Risk
        </NavLink>

        <NavLink to="/forecast" style={navStyle}>
          Forecast
        </NavLink>

        <NavLink to="/upload" style={navStyle}>
          Upload
        </NavLink>
      </div>
    </div>
  );
}

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  fontWeight: 500,
  color: isActive ? "#ffffff" : "#c7d2fe",
  background: isActive ? "#4f46e5" : "transparent",
  transition: "all 0.2s"
});

const styles = {
  wrapper: {
    height: "60px",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },
  logo: {
    color: "white",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.5px"
  },
  menu: {
    display: "flex",
    gap: "10px"
  }
};
