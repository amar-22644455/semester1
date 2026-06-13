const Button = ({ 
  children, 
  onClick, 
  className = "", 
  type = "button", 
  disabled = false,
  variant = "default"
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-2";
  const variants = {
    default: "bg-[#9e4635] hover:bg-[#8f3a2c] text-white",
    ghost: "bg-transparent hover:bg-[#9e4635]/20 text-gray-700 hover:text-[#9e4635]",
    outline: "bg-transparent border border-[#9e4635] text-[#9e4635] hover:bg-[#9e4635]/20"
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

export default Button;

  