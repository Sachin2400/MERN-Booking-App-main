export default function Image({ src, ...rest }) {
  if (!src) return null;

  const apiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace('/api', '');

  let imageSrc = src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    imageSrc = src;
  } else {
    imageSrc = `${apiUrl}/uploads/${src.replace(/^uploads[\\/]/, '')}`;
  }

  return (
    <img {...rest} src={imageSrc} alt={rest.alt || 'Booking photo'} />
  );
}
