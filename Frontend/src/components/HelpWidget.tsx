import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./HelpWidget.css";

const HelpWidget: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="help-widget-container">
      <motion.div
        className="help-widget-question"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ rotate: hovered ? 20 : 0, scale: hovered ? 1.18 : 1, boxShadow: hovered ? "0 4px 24px #2dceef88" : "0 2px 8px #5ecb8c33" }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        ?
      </motion.div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="help-widget-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
          >
            <div className="help-widget-title">How does Pawn Stars work?</div>
            <ol className="help-widget-list help-widget-ol">
              <li>The <b>Captain</b> creates a lobby and invites others.</li>
              <li>Each chess piece is controlled by a different player.</li>
              <li>On your turn, the Captain chooses <b>which piece</b> will move.</li>
              <li>The player assigned to that piece chooses <b>how</b> it moves.</li>
              <li>Each player has <b>10 seconds</b> to make their move.</li>
              <li>Work together to win as a team!</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpWidget;
