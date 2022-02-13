import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import React from 'react';

function Callback(): JSX.Element {
  return (
    <Layout title="Authentication Result">
      <main className="container margin-vert--lg">
        <BrowserOnly>
          {() => {
            const params = Object.fromEntries(new URL(window.location.href).searchParams);
            return params.code != null ? (
              <>
                <h1>Authetication Succeeded</h1>
                <p>Please copy the authorization code below and paste it in the options page.</p>
                <CodeBlock>{params.code}</CodeBlock>
              </>
            ) : (
              <>
                <h1>Authentication Failed</h1>
                <p>Please check the error message below.</p>
                <CodeBlock className="language-json">{JSON.stringify(params, null, 2)}</CodeBlock>
              </>
            );
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}

export default Callback;
