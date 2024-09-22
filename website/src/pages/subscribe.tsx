import { useEffect } from "react";

const Subscribe: React.FC = () => {
  useEffect(() => {
    const optionsURL = new URL(
      "chrome-extension://pncfbmialoiaghdehhbnbhkkgmjanfhe/pages/options.html",
    );
    const query = new URL(window.location.href).searchParams;
    const name = query.get("name");
    if (name != null) {
      optionsURL.searchParams.set("addSubscriptionName", name);
    }
    const url = query.get("url");
    if (url != null) {
      optionsURL.searchParams.set("addSubscriptionURL", url);
    }
    window.location.href = optionsURL.toString();
  }, []);
  return null;
};

export default Subscribe;
