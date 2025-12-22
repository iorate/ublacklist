// Commented out because webdav package pulls in @types/node, causing duplicate declaration.
// declare var process: { env: NodeJS.ProcessEnv };

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.yml" {
  const content: string;
  export default content;
}
