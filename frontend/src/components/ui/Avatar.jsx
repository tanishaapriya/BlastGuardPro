import { initials } from '../../utils/formatters';

const SIZES = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

export default function Avatar({ name, size = 'md', className = '' }) {
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${SIZES[size]} ${className}`}
      style={{ background: 'linear-gradient(135deg, #3B82F6, #EF4444)' }}>
      {initials(name)}
    </div>
  );
}
