import BrowserOnly from "@docusaurus/BrowserOnly";
import Translate from "@docusaurus/Translate";
import CodeBlock from "@theme/CodeBlock";
import Layout from "@theme/Layout";

const Callback: React.FC = () => (
  <Layout title="Authentication Result">
    <main className="container margin-vert--lg">
      <BrowserOnly>
        {() => {
          const params = Object.fromEntries(
            new URL(window.location.href).searchParams,
          );
          return params.code != null ? (
            <>
              <h1>
                <Translate id="pages.callback.success.title" />
              </h1>
              <p>
                <Translate id="pages.callback.success.copyCode" />
              </p>
              <CodeBlock>{params.code}</CodeBlock>
            </>
          ) : (
            <>
              <h1>
                <Translate id="pages.callback.failure.title" />
              </h1>
              <p>
                <Translate id="pages.callback.failure.checkError" />
              </p>
              <CodeBlock className="language-json">
                {JSON.stringify(params, null, 2)}
              </CodeBlock>
            </>
          );
        }}
      </BrowserOnly>
    </main>
  </Layout>
);

export default Callback;
