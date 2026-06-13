const Input = ({ type = "text", placeholder, value, onChange, className }) => {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4635] ${className}`}
      />
    );
  };
  
export default Input;
  