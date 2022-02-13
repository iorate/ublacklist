import { useEffect } from 'react';

function Subscribe(): JSX.Element {
  useEffect(() => {
    const optionsURL = new URL(
      'chrome-extension://pncfbmialoiaghdehhbnbhkkgmjanfhe/pages/options.html',
    );
    const query = new URL(window.location.href).searchParams;
    if (query.has('name')) {
      optionsURL.searchParams.set('addSubscriptionName', query.get('name'));
    }
    if (query.has('url')) {
      optionsURL.searchParams.set('addSubscriptionURL', query.get('url'));
    }
    window.location.href = optionsURL.toString();
  }, []);
  return null;
}

export default Subscribe;
