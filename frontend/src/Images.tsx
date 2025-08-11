import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from './api';
import { getAccessToken } from './utils';
import { Box, Drawer, Toolbar, IconButton, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Modal, ImageList, ImageListItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';

const Images: React.FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const [selected, setSelected] = useState('images');
  // Removed images state, now using gallery only
  const [gallery, setGallery] = useState<any[]>([]);
  // Modal state for image preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);
  // Fetch gallery images from backend
  const fetchImages = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/image/images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setGallery(data);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    }
  };
  useEffect(() => {
    fetchImages();
  }, []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleNav = (route: string) => {
    setSelected(route);
    navigate(`/${route}`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const token = getAccessToken();
        console.log('Uploading to:', `${API_URL}/image/upload-image`);
        const response = await fetch(`${API_URL}/image/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error('Image upload failed');
        }
        // On successful upload, refetch gallery
        await fetchImages();
      } catch (err) {
        console.error('Failed to upload image:', err);
        window.alert('Failed to upload image. See console for details.');
      }
    }
    setUploading(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 200 : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? 200 : 60,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center' }}>
            <IconButton onClick={handleDrawerToggle} size="large">
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'dashboard'} onClick={() => handleNav('dashboard')}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Dashboard" />
                </Collapse>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'images'} onClick={() => handleNav('images')}>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Images" />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Box>
          <Divider />
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <Collapse in={open} orientation="horizontal">
                  <ListItemText primary="Logout" />
                </Collapse>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <h1>Images</h1>
        <div style={{ marginBottom: 24 }}>
          <button onClick={handleUploadClick} style={{ marginRight: 12 }} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Gallery</Typography>
          {gallery.length === 0 ? (
            <Typography color="text.secondary">No images found.</Typography>
          ) : (
            <>
              <ImageList
                sx={{
                  width: '100%',
                  margin: 0,
                  px: { xs: 0, sm: 2, md: 2 },
                  // Responsive grid
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  py: 2,
                }}
                cols={3}
                rowHeight={520}
                gap={36}
              >
              {gallery.map((img) => (
                <ImageListItem
                  key={img.id}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                    transition: 'box-shadow 0.12s cubic-bezier(0.4,0,0.2,1)',
                    background: 'transparent',
                    border: 'none',
                    '&:hover': {
                      boxShadow: '0 8px 40px 0 rgba(0,0,0,0.28)',
                      background: 'transparent',
                      border: 'none',
                    },
                  }}
                  onClick={() => { setModalImg(`${API_URL}/${img.file_path}`); setModalOpen(true); }}
                >
                  <img
                    src={`${API_URL}/${img.file_path}`}
                    alt={img.file_path.split('/').pop()}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 520,
                      objectFit: 'cover',
                      borderRadius: 24,
                      transition: 'filter 0.2s',
                      background: '#eee',
                      margin: 0,
                      padding: 0,
                    }}
                  />
                </ImageListItem>
              ))}
              </ImageList>
              {/* Modal for image preview */}
              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="image-modal-title"
                aria-describedby="image-modal-description"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    outline: 'none',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.85)',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  {modalImg && (
                    <img
                      src={modalImg}
                      alt="Preview"
                      style={{
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                        borderRadius: 8,
                        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                        background: '#222',
                      }}
                    />
                  )}
                </Box>
              </Modal>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Images;
