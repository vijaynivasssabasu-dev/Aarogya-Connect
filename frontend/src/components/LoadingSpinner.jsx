export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' };
  return <div className={`flex justify-center items-center ${className}`}><div className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizes[size]}`} /></div>;
}
