import Home from "./Home/Home";
import About from "./About/About";
import Projects from "./Projects/Projects";
import Skills from "./Skills/Skills";

const pages = [
  {
    name: "Home",
    path: "/",
    Component: Home,
  },
  {
    name: "About",
    path: "/about",
    Component: About,
  },
  {
    name: "Projects",
    path: "/projects",
    Component: Projects,
  },
  {
    name: "Skills",
    path: "/skills",
    Component: Skills,
  },
]

export default pages;
