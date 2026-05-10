import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function SkeletonLoader({ rows }) {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton 
          key={index} 
          animation="wave" 
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
  );
}