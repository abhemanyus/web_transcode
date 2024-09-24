import  { useState } from 'react';
import VideoUpload from './VideoUpload';
import Modal from './Modal';
import { FaVideo } from 'react-icons/fa'; // FontAwesome icon

const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div>
      <button style={floatingButtonStyle} onClick={openModal}>
        <FaVideo size={24} />
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <VideoUpload />
      </Modal>
    </div>
  );
};

const floatingButtonStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '50%',
  color: '#fff',
  padding: '15px',
  cursor: 'pointer',
  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
} as const;

export default App;
