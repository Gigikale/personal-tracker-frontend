import React from 'react';
import '../styles/EditTargetModal.css';

const EditTargetModal = ({
  isOpen,
  onClose,
  category,
  onSave,
  newAmount,
  setNewAmount
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-target-title">
      <div className="modal-content">
        <h3 id="edit-target-title">Edit Monthly Target</h3>
        <p><strong>Category:</strong> {category}</p>
        <input
          type="number"
          min="0"
          value={newAmount}
          onChange={(e) => setNewAmount(parseFloat(e.target.value))}
          placeholder="New Target Amount"
        />
        <div className="modal-actions">
          <button
            onClick={onSave}
            className="btn-save"
            disabled={!newAmount || newAmount <= 0}
          >
            Save
          </button>
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTargetModal;
