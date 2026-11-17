import { Box } from '@mui/material'
import { SkeletonBox, SkeletonStatusRegion, SkeletonText } from './Skeleton'

/**
 * Fallback do carregamento de rota (code splitting). Fica no lugar do
 * conteúdo, mantendo header/footer/nav no ar — sem isso o lazy renderiza uma
 * tela em branco a cada navegação.
 */
export const PageFallback = () => (
  <SkeletonStatusRegion label='Carregando página…'>
    <Box sx={{ width: '100%', padding: '48px 20px', boxSizing: 'border-box' }}>
      <SkeletonBox width='38%' height={32} radius={10} />
      <Box sx={{ marginTop: '24px' }}>
        <SkeletonText
          lines={3}
          widths={['100%', '88%', '64%']}
          lineHeight={14}
        />
      </Box>
    </Box>
  </SkeletonStatusRegion>
)
