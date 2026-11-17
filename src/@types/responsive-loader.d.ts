interface ResponsiveLoaderOutput {
  height: number;
  images: { path: string; width: number; height: number }[];
  placeholder: string | undefined;
  src: string;
  srcSet: string;
  toString: () => string;
  width: number;
}

declare module "*.jpeg?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}

declare module "*.jpeg?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048&format=webp" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}

declare module "*.jpg?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}

declare module "*.jpg?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048&format=webp" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}

declare module "*.png?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}

declare module "*.png?sizes[]=256,sizes[]=512,sizes[]=1024,sizes[]=2048&format=webp" {
  const responsiveLoaderOutput: ResponsiveLoaderOutput;

  export default responsiveLoaderOutput;
}
