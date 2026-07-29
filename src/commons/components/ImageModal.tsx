import React from "react";
import "./imageModal.css";

interface Props {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<Props> = ({ src, onClose }) => (
  <div className="image-modal-overlay" onClick={onClose} role="presentation">
    <button
      type="button"
      className="image-modal-close"
      onClick={onClose}
      aria-label="Cerrar vista previa"
    >
      ×
    </button>
    <img
      src={src}
      alt="Vista previa"
      className="image-modal-img"
      onClick={(event) => event.stopPropagation()}
    />
  </div>
);

export default ImageModal;
