import type { FC } from "react";
import "./loadingScreen.css";

const LoadingScreen: FC = () => {

  return (
    <div className="loading-screen">
      <div className="spinner-balls">
        <div className="ball ball1"></div>
        <div className="ball ball2"></div>
        <div className="ball ball3"></div>
        <div className="ball ball4"></div>
        <div className="ball ball5"></div>
        <div className="ball ball6"></div>
        <div className="ball ball7"></div>
        <div className="ball ball8"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
