"use client";

import { motion } from "motion/react";
import { memo } from "react";

// eslint-disable-next-line react/display-name
const Caret = memo(() => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0.6 }}
    transition={{ duration: 0.1 }}
    className="absolute w-0.5 bg-accent-foreground"
    layoutId="caret"
    style={{ height: "1.3em", left: "-2px" }}
  />
));

export default Caret;
