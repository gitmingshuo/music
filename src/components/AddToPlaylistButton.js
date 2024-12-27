import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaPlus } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import './AddToPlaylistButton.css';

function AddToPlaylistButton({ song }) {
  const [showMenu, setShowMenu] = useState(false);
  const { playlists, addSongToPlaylist, createPlaylist } = useMusic();
  const menuRef = useRef(null);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToPlaylist = (e, playlistId) => {
    e.stopPropagation();
    addSongToPlaylist(playlistId, song);
    setShowMenu(false);
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateInput(false);
    }
  };

  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.right + 4,
      });
    }
  };

  useEffect(() => {
    if (showMenu) {
      updateMenuPosition();
      // 添加窗口大小改变时的位置更新
      window.addEventListener('resize', updateMenuPosition);
      return () => window.removeEventListener('resize', updateMenuPosition);
    }
  }, [showMenu]);

  return (
    <div className="add-to-playlist" ref={menuRef}>
      <button 
        ref={buttonRef}
        className="more-btn"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
      >
        <FaEllipsisV />
      </button>

      {showMenu && (
        <div 
          className="playlist-menu"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          <div className="menu-header">
            添加到歌单
          </div>
          
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              className="menu-item"
              onClick={(e) => handleAddToPlaylist(e, playlist.id)}
            >
              {playlist.name}
              <span className="song-count">
                {playlist.songs.length}首
              </span>
            </div>
          ))}

          <div className="menu-divider"></div>
          
          {showCreateInput ? (
            <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
              <input
                type="text"
                placeholder="歌单标题"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <div 
              className="menu-item create-playlist"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateInput(true);
              }}
            >
              <FaPlus />
              创建新歌单
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddToPlaylistButton; 