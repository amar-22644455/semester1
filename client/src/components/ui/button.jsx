const Button = ({ children, onClick, className, type = "button" }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`!bg-[#4c66db] text-white px-4 py-2 rounded hover:bg-[#6f85e5] ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  