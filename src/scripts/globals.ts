declare var process: { env: NodeJS.ProcessEnv };

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.yml" {
  const content: string;
  export default content;
}
