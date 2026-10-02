import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Registro único dos plugins (módulo é avaliado uma só vez).
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
