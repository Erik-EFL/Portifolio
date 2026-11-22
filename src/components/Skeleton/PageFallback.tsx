import { SkeletonBox, SkeletonStatusRegion, SkeletonText } from './Skeleton'
import { SkeletonPageFallback } from './Skeleton.styled'

/**
 * Fallback do carregamento de rota (code splitting). Fica no lugar do
 * conteúdo, mantendo header/footer/nav no ar — sem isso o lazy renderiza uma
 * tela em branco a cada navegação.
 */
export const PageFallback = () => (
  <SkeletonStatusRegion label='Carregando página…'>
    <SkeletonPageFallback>
      <SkeletonBox width='38%' height={32} radius={10} />
      <SkeletonText lines={3} widths={['100%', '88%', '64%']} lineHeight={14} />
    </SkeletonPageFallback>
  </SkeletonStatusRegion>
)
