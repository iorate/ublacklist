import React, { useContext, useEffect, useRef, useState } from "react";

export type Theme = {
  name: string;
  background: string;
  button: {
    primary: {
      background: string;
      backgroundActive: string;
      backgroundDisabled: string;
      backgroundHovered: string;
      text: string;
      textDisabled: string;
    };
    secondary: {
      background: string;
      backgroundActive: string;
      backgroundDisabled: string;
      backgroundHovered: string;
      border: string;
      text: string;
      textDisabled: string;
    };
  };
  checkBox: {
    border: string;
    box: string;
    checkMark: string;
  };
  colorPicker: {
    border: string;
    popoverBackground: string;
  };
  dialog: {
    background: string;
  };
  editor: {
    border: string;
  };
  focus: {
    circle: string;
    shadow: string;
  };
  iconButton: string;
  input: {
    border: string;
  };
  link: {
    text: string;
  };
  menu: {
    itemBackgroundFocused: string;
    itemBackgroundHovered: string;
    itemListBackground: string;
  };
  radioButton: {
    unchecked: string;
    checked: string;
  };
  section: {
    background: string;
    shadow1: string;
    shadow2: string;
  };
  select: {
    arrow: string;
    border: string;
    optionBackground: string;
  };
  separator: string;
  switch: {
    bar: string;
    barChecked: string;
    knob: string;
    knobBorder?: string;
    knobChecked: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  textArea: {
    border: string;
  };
};

export const darkTheme: Readonly<Theme> = {
  name: "dark",
  background: "rgb(32, 33, 36)",
  button: {
    primary: {
      background: "rgb(138, 180, 248)",
      backgroundActive: "rgba(138, 180, 248, 0.8)",
      backgroundDisabled: "rgb(60, 64, 67)",
      backgroundHovered: "rgba(138, 180, 248, 0.9)",
      text: "rgb(32, 33, 36)",
      textDisabled: "rgb(128, 134, 139)",
    },
    secondary: {
      background: "transparent",
      backgroundActive: "rgba(138, 180, 248, 0.16)",
      backgroundDisabled: "transparent",
      backgroundHovered: "rgba(138, 180, 248, 0.08)",
      border: "rgb(95, 99, 104)",
      text: "rgb(138, 180, 248)",
      textDisabled: "rgb(128, 134, 139)",
    },
  },
  checkBox: {
    border: "rgb(154, 160, 166)",
    box: "rgb(138, 180, 248)",
    checkMark: "rgb(32, 33, 36)",
  },
  colorPicker: {
    border: "rgb(95, 99, 104)",
    popoverBackground: "rgb(41, 42, 45)",
  },
  dialog: {
    background: "rgb(41, 42, 45)",
  },
  editor: {
    border: "rgb(95, 99, 104)",
  },
  focus: {
    shadow: "rgba(138, 180, 248, 0.5)",
    circle: "rgba(138, 180, 248, 0.4)",
  },
  iconButton: "rgb(154, 160, 166)",
  input: {
    border: "rgb(95, 99, 104)",
  },
  link: {
    text: "rgb(138, 180, 248)",
  },
  menu: {
    itemBackgroundFocused: "rgba(95, 99, 104, 0.6)",
    itemBackgroundHovered: "rgba(95, 99, 104, 0.3)",
    itemListBackground: "rgb(41, 42, 45)",
  },
  radioButton: {
    unchecked: "rgb(154, 160, 166)",
    checked: "rgb(138, 180, 248)",
  },
  section: {
    background: "rgb(41, 42, 45)",
    shadow1: "rgba(0, 0, 0, 0.3)",
    shadow2: "rgba(0, 0, 0, 0.15)",
  },
  select: {
    arrow: "rgb(154, 160, 166)",
    border: "rgb(95, 99, 104)",
    optionBackground: "rgb(41, 42, 45)",
  },
  separator: "rgba(255, 255, 255, 0.1)",
  switch: {
    bar: "rgb(154, 160, 166)",
    barChecked: "rgba(138, 180, 248, 0.5)",
    knob: "rgb(218, 220, 224)",
    knobChecked: "rgb(138, 180, 248)",
  },
  text: {
    primary: "rgb(232, 234, 237)",
    secondary: "rgb(154, 160, 166)",
  },
  textArea: {
    border: "rgb(95, 99, 104)",
  },
};

export const lightTheme: Readonly<Theme> = {
  name: "light",
  background: "rgb(248, 249, 250)",
  button: {
    primary: {
      background: "rgb(26, 115, 232)",
      backgroundActive: "rgba(26, 115, 232, 0.8)",
      backgroundDisabled: "rgb(241, 243, 244)",
      backgroundHovered: "rgba(26, 115, 232, 0.9)",
      text: "white",
      textDisabled: "rgb(128, 134, 139)",
    },
    secondary: {
      background: "transparent",
      backgroundActive: "rgba(66, 133, 244, 0.08)",
      backgroundDisabled: "transparent",
      backgroundHovered: "rgba(66, 133, 244, 0.04)",
      border: "rgb(218, 220, 224)",
      text: "rgb(26, 115, 232)",
      textDisabled: "rgb(128, 134, 139)",
    },
  },
  checkBox: {
    border: "rgb(95, 99, 104)",
    box: "rgb(26, 115, 232)",
    checkMark: "white",
  },
  colorPicker: {
    border: "rgb(218, 220, 224)",
    popoverBackground: "white",
  },
  dialog: {
    background: "white",
  },
  editor: {
    border: "rgb(218, 220, 224)",
  },
  focus: {
    shadow: "rgba(26, 115, 232, 0.4)",
    circle: "rgba(26, 115, 232, 0.2)",
  },
  iconButton: "rgb(95, 99, 104)",
  input: {
    border: "rgb(218, 220, 224)",
  },
  link: {
    text: "rgb(51, 103, 214)",
  },
  menu: {
    itemBackgroundFocused: "rgba(189, 193, 198, 0.3)",
    itemBackgroundHovered: "rgba(189, 193, 198, 0.15)",
    itemListBackground: "white",
  },
  radioButton: {
    unchecked: "rgb(95, 99, 104)",
    checked: "rgb(26, 115, 232)",
  },
  section: {
    background: "white",
    shadow1: "rgba(60, 64, 67, 0.3)",
    shadow2: "rgba(60, 64, 67, 0.15)",
  },
  select: {
    arrow: "rgb(95, 99, 104)",
    border: "rgb(218, 220, 224)",
    optionBackground: "white",
  },
  separator: "rgba(0, 0, 0, 0.06)",
  switch: {
    bar: "rgb(189, 193, 198)",
    barChecked: "rgba(26, 115, 232, 0.5)",
    knob: "white",
    knobBorder: "rgb(218, 220, 224)",
    knobChecked: "rgb(26, 115, 232)",
  },
  text: {
    primary: "rgb(32, 33, 36)",
    secondary: "rgb(95, 99, 104)",
  },
  textArea: {
    border: "rgb(218, 220, 224)",
  },
};

export type ThemeProviderProps = { children?: React.ReactNode; theme: Theme };

const ThemeContext = React.createContext<ThemeProviderProps>({
  theme: lightTheme,
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme,
}) => {
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};

export function useTheme(): Theme {
  const { theme } = useContext(ThemeContext);
  return theme;
}

export const AutoThemeProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const preferDark = useRef(window.matchMedia("(prefers-color-scheme: dark)"));
  const [dark, setDark] = useState(preferDark.current.matches);
  useEffect(() => {
    preferDark.current.addEventListener("change", (e) => {
      setDark(e.matches);
    });
  }, []);
  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
};
