import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Container,
  Card,
  Avatar,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  styled,
  Fade
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

// Base API configuration for the applicant backend (relative URL for Vercel & local proxy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const api = axios.create({ baseURL: API_BASE_URL });

// Helper: convert a File object to a base64 data URL string
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Helper: compress image file client-side before base64 conversion (prevents HTTP 413 Payload Too Large)
const compressImageFile = (file, maxWidth = 500, maxHeight = 500, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      return resolve('');
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user: userData } = response.data;
      if (token && userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Login Failed, Try Again';
      alert(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

// Styled Components
const AvatarWrapper = styled('div')({ position: 'relative', display: 'inline-block' });

const StatusDot = styled('div')(({ status }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: status === 'online' ? '#4caf50' : status === 'away' ? '#ffc107' : status === 'offline' ? '#f44336' : '#757575',
  position: 'absolute',
  bottom: 0,
  right: 0,
  border: '2px solid white',
}));

const CardContainer = styled(Card)(() => ({
  borderRadius: 16,
  overflow: 'hidden',
  maxWidth: 600,
  margin: '0 auto',
  backgroundColor: '#fff',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': { backgroundColor: theme.palette.grey[50] },
  cursor: 'pointer',
}));

const ExpandIconButton = styled(({ expand, ...other }) => <IconButton {...other} />)(({ theme, expand }) => ({
  transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shortest }),
}));

// ============ NAVBAR ============
function Navbar({ onLoginClick }) {
  const { isAuthenticated, logout } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 2000 && clickCount === 1) {
      onLoginClick();
      setClickCount(0);
      setLastClickTime(0);
      return;
    }
    setClickCount(1);
    setLastClickTime(now);
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', pr: '5%', zIndex: 1100 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <img
          onClick={handleLogoClick}
          onDoubleClick={onLoginClick}
          src="/logo-mccain.png"
          alt="Logo"
          title="Double click logo to open admin login"
          style={{ width: '125px', transform: 'translateY(1rem)', cursor: 'pointer' }}
        />
        <Box>
          {isAuthenticated && (
            <Button variant="contained" sx={{ bgcolor: 'darkred', color: 'white', '&:hover': { bgcolor: 'red' } }} onClick={logout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// ============ HOME PAGE (sR equivalent) ============
function HomePage() {
  return (
    <div className="home-page" style={{ paddingBlock: '1rem' }}>
      {/* Hero Banner */}
      <div className="main-banner">
        <div className="page-banner">
          <div className="page-banner-content">
            <h1 className="main-title" style={{ color: '#000000' }}>
              We are McCain<span className="yellow-title">.</span>
            </h1>
            <div className="overview">
              <p style={{ textAlign: 'center', color: '#000000' }}>
                Your career is here.<br />
                Discover why now.<br /><br />
              </p>
              <div className="button-wrapper align-center">
                <div className="button-holder yellow rounded no-uppercase">
                  <a className="button" role="button" href="https://www.mccain.com/careers/">
                    LEARN ABOUT CAREERS WITH McCAIN
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            className="page-banner-image page-banner-vimeo has-mobile-image"
            style={{ backgroundImage: 'url(/media/4480/careers-home-page-image.png)' }}
          >
            <img
              src="/McCain Foods Global Corporate Website _ McCain.com_files/home-page-image.jpg"
              alt="We are McCain Banner Image"
              className="mobile"
            />
            <iframe
              src="/McCain Foods Global Corporate Website _ McCain.com_files/805985356.html"
              frameBorder="0"
              allow="autoplay; encrypted-media;"
              allowFullScreen
              className="desktop"
            />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <section className="page-content">
        <div className="umb-grid">
          <div className="grid-section">

            {/* Empty spacer row */}
            <div className="full-width-row">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-12 column">
                    <div></div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Our Business + Careers cards */}
            <div className="large-row-mobile">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.mccain.com/about-us/our-business-brands/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Our Business<span className="yellow-title">.</span></div>
                            <div className="subtitle">Famous for French fries and more!</div>
                            <div className="text"><p>Learn about our<br />business &amp; brand</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/skins-on-french-fries.jpg" alt="Skins on French Fries" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.mccain.com/careers/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Careers<span className="yellow-title">.</span></div>
                            <div className="subtitle">Unlocking your potential</div>
                            <div className="text"><p>Discover exciting new career opportunities</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/mccain-foods-team-member-at-a-conference.jpg" alt="McCain Foods team member" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Hot Potato Podcast - text on image */}
            <div className="full-width-row">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-12 column">
                    <div>
                      <div className="text-on-image-wrapper columns-2 has-mobile-global">
                        <div className="text-on-image-inner">
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text"></div>
                            </div>
                          </div>
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text">
                                <h2 style={{ textAlign: 'center' }}>
                                  Check out our<br />'Hot Potato'<br />sustainability podcast<span className="yellow-title">.<br /></span>
                                </h2>
                                <div className="button-wrapper align-center">
                                  <div className="button-holder yellow rounded">
                                    <a className="button" role="button" href="https://www.mccain.com/sustainability/in-action/">Learn More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="desktop-image">
                          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/mccain_hot_potato_d.jpg" alt="McCain_Hot_Potato_D" />
                        </div>
                        <div className="mobile-image">
                          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/mccain_foods_hot_potato_m.jpg" alt="McCain_Foods_Hot_Potato_M" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Social Media + Sustainability cards */}
            <div className="large-row-mobile">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.linkedin.com/company/mccainfoods/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Social Media<span className="yellow-title">.</span></div>
                            <div className="subtitle">Keep up-to-date on our latest news</div>
                            <div className="text"><p>Follow @McCain Foods<br />on LinkedIn</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/holding-smartphone.jpg" alt="Holding smartphone" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.mccain.com/sustainability/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Sustainability<span className="yellow-title">.</span></div>
                            <div className="subtitle"> For the generations to come</div>
                            <div className="text"><p>Our progress<br />&amp; commitments</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/wind-turbine-in-field.jpg" alt="Wind Turbine in Field" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Celebrating real connections - text on image */}
            <div className="full-width-row">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-12 column">
                    <div>
                      <div className="text-on-image-wrapper columns-2 has-mobile-global">
                        <div className="text-on-image-inner">
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text"></div>
                            </div>
                          </div>
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text">
                                <h2 style={{ textAlign: 'center' }}>
                                  Celebrating<br />real connections<br />through delicious<br />planet-friendly food<span className="yellow-title">.</span>
                                </h2>
                                <div className="button-wrapper align-center">
                                  <div className="button-holder yellow rounded">
                                    <a className="button" role="button" href="https://www.mccain.com/about-us/our-purpose-values/">LEARN ABOUT OUR PURPOSE</a>
                                  </div>
                                </div>
                                <p style={{ textAlign: 'center' }}>©</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="desktop-image">
                          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/farmer-holding-potatoes-header.png" alt="Person holding four potatoes. Potatoes in the background." />
                        </div>
                        <div className="mobile-image">
                          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/farmer-holding-potatoes-mobile-header.jpg" alt="Person holding four potatoes" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Customers + Our Food cards */}
            <div className="large-row-mobile">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.mccain.com/our-partners/customers/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Customers<span className="yellow-title">.</span></div>
                            <div className="subtitle">Working in partnership for growth</div>
                            <div className="text"><p>Learn about foodservice and retail</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/chef-cooking.jpg" alt="Chef Cooking" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                  <div className="col-md-6 column">
                    <div>
                      <a className="box-with-image white" href="https://www.mccain.com/about-us/our-passion-for-food/">
                        <div className="white-wrapper">
                          <div className="box-content">
                            <div className="title">Our Food<span className="yellow-title">.</span></div>
                            <div className="subtitle">Hear about our passion for food</div>
                            <div className="text"><p>Discover our delicious<br />range of food</p></div>
                          </div>
                          <div className="box-image">
                            <img src="./McCain Foods Global Corporate Website _ McCain.com_files/cooked-potatoes.jpg" alt="Cooked Potatoes" />
                          </div>
                          <div className="arrow"></div>
                        </div>
                      </a>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* News / Information Centre - text on image */}
            <div className="full-width-row">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-12 column">
                    <div>
                      <div className="text-on-image-wrapper columns-2 has-mobile-global">
                        <div className="text-on-image-inner">
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text"></div>
                            </div>
                          </div>
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text">
                                <h2 style={{ textAlign: 'center' }}>
                                  McCain Foods releases 'Farm of the Future' Canada Year Three Report<span className="yellow-title">.</span>
                                </h2>
                                <div className="button-wrapper align-center">
                                  <div className="button-holder yellow-border rounded">
                                    <a href="https://www.mccain.com/information-centre/news/mccain-foods-releases-farm-of-the-future-canada-year-three-report/" className="button" role="button">Read more</a>
                                  </div>
                                </div>
                                <div className="button-holder yellow rounded">
                                  <a href="https://www.mccain.com/information-centre/news" className="button" role="button">Information Centre</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Instagram section */}
            <div className="full-width-row">
              <div className="container">
                <div className="row clearfix">
                  <div className="col-md-12 column">
                    <div>
                      <div className="text-on-image-wrapper columns-2">
                        <div className="text-on-image-inner">
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text"></div>
                            </div>
                          </div>
                          <div className="text-on-image-item">
                            <div className="article-content">
                              <div className="text">
                                <h2 style={{ textAlign: 'center' }}>
                                  Discover more about<br />McCain on Instagram<span className="yellow-title">.<br /></span>
                                </h2>
                                <div className="button-wrapper align-center">
                                  <div className="button-holder yellow rounded no-uppercase">
                                    <a className="button" role="button" href="https://www.instagram.com/mccainglobal/" target="_blank" rel="noreferrer">
                                      FOLLOW @McCainGlobal ON INSTAGRAM
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="desktop-image">
                          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/follow-mccain-foods-on-linkedin.jpeg" alt="Person looking at their smartphone, sat by laptop" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {' '}
                </div>
              </div>
            </div>

            {/* Audience Section moved below applicant lists */}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ AUDIENCE & I WOULD LIKE TO KNOW SECTION ============
function AudienceSection() {
  return (
    <div className="like-to-know-holder">
      <div className="dropdown-holder">
        <div className="dropdown-title" id="like-to-know-ddl">I would like to know about...</div>
        <div className="dropdown-items">
          <a href="https://www.mccain.com/careers/">What is it like to work at McCain Foods?</a>
          <a href="https://www.mccain.com/careers/how-to-apply/">How do I make a job application?</a>
          <a href="https://www.mccain.com/contact/">How do I contact McCain Foods?</a>
          <a href="https://www.mccain.com/information-centre/mccain-foods-worldwide/">How do I find other McCain websites?</a>
          <a href="https://www.mccain.com/information-centre/mccain-foods-worldwide/">How do I find McCain social media?</a>
          <a href="https://www.mccain.com/about-us/our-leadership/">Who is your CEO &amp; Board?</a>
          <a href="https://www.mccain.com/about-us/farmers/">How do I become a Grower/Farmer?</a>
        </div>
      </div>
      <div className="audience-holder">
        <a className="audience-item" href="https://www.mccain.com/about-us/our-business-brands/">
          <div className="audience-image">
            <img src="/McCain Foods Global Corporate Website _ McCain.com_files/foodservice-icon-for-com.png" alt="Icon - box of french fries" />
          </div>
          <div className="audience-title">For<br /> <span className="Festival">customers</span></div>
        </a>
        <a className="audience-item" href="https://www.mccain.com/careers/">
          <div className="audience-image">
            <img src="/McCain Foods Global Corporate Website _ McCain.com_files/career-icon-for-com.png" alt="Icon - 3 hands on top of each other" />
          </div>
          <div className="audience-title">For<br /> <span className="Festival">candidates</span></div>
        </a>
        <a className="audience-item" href="https://www.mccain.com/information-centre/news/">
          <div className="audience-image">
            <img src="/McCain Foods Global Corporate Website _ McCain.com_files/journalist-icon-for-com.png" alt="Icon - laptop" />
          </div>
          <div className="audience-title">For<br /> <span className="Festival">journalists &amp; media</span></div>
        </a>
        <a className="audience-item" href="https://www.mccain.com/about-us/farmers/">
          <div className="audience-image">
            <img src="/McCain Foods Global Corporate Website _ McCain.com_files/farmer-icon-for-com.png" alt="Icon - tractor" />
          </div>
          <div className="audience-title">For<br /> <span className="Festival">farmers &amp; growers</span></div>
        </a>
        <a className="audience-item" href="https://www.mccain.com/sustainability/">
          <div className="audience-image">
            <img src="/McCain Foods Global Corporate Website _ McCain.com_files/sustainability-icon-for-com.png" alt="Icon - plant growing from ground" />
          </div>
          <div className="audience-title">For<br /> <span className="Festival">sustainability &amp; community</span></div>
        </a>
      </div>
    </div>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="breadcrumb"></div>
        <div className="footer-dropdown">
          <div className="footer-dropdown-holder">
            <a href="https://www.mccain.com/careers/">CANDIDATES</a>
            <a href="https://www.mccain.com/information-centre/">JOURNALISTS</a>
            <a href="https://www.mccain.com/about-us/farmers/">FARMERS</a>
            <a href="https://www.mccain.com/our-partners/customers/">CUSTOMERS</a>
          </div>
          <div className="footer-dropdown-button">McCain for...</div>
        </div>
      </div>
      <div className="footer-bottom">
        <a href="https://www.mccain.com/" className="logo">
          <img src="./McCain Foods Global Corporate Website _ McCain.com_files/logo-we-are-mccain.png" alt="McCain Logo" />
        </a>
        <div className="footer-links-holder">
          <a href="https://www.mccain.com/privacy/" className="footer-link">Global Privacy Policy</a>
          <a href="https://www.mccain.com/terms-and-conditions/" className="footer-link">Legal Information</a>
          <a href="https://www.mccain.com/#cookie-declaration" className="footer-link">Cookies</a>
          <div>© 2023 McCain Foods Limited</div>
        </div>
      </div>
    </footer>
  );
}

// ============ LOGIN MODAL ============
function LoginModal({ open, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Username" type="text" fullWidth required value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="dense" label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Login</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ============ ADD MODAL ============
function AddModal({ open, onClose, onAddUser }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [passport, setPassport] = useState('');
  const [status, setStatus] = useState('accepted');
  const [photo, setPhoto] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser({ name, phone, age: parseInt(age), passportNumber: passport, status, photo });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Applicant</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" type="text" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField margin="dense" label="Phone" type="text" fullWidth required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField margin="dense" label="Age" type="number" fullWidth required value={age} onChange={(e) => setAge(e.target.value)} />
          <TextField margin="dense" label="Passport Number" type="text" fullWidth required value={passport} onChange={(e) => setPassport(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem sx={{ color: 'darkgreen' }} value="accepted">Accepted</MenuItem>
              <MenuItem sx={{ color: 'darkgray' }} value="pending">Pending</MenuItem>
              <MenuItem sx={{ color: 'darkred' }} value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <input type="file" accept="image/*" style={{ marginTop: '16px', display: 'block', fontSize: '.8em' }} onChange={(e) => setPhoto(e.target.files[0])} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Add User</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ============ UPDATE MODAL ============
function UpdateModal({ open, onClose, onUpdateUser, onDeleteUser, user }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [passport, setPassport] = useState('');
  const [status, setStatus] = useState('accepted');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAge((user.age || '').toString());
      setPassport(user.passportNumber || user.passport || '');
      setStatus(user.status || 'accepted');
      setPhoto(null);
      const existingPhoto = user.photo || user.profilePhoto || '';
      setPhotoPreview(existingPhoto);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      const existingPhoto = user.photo || user.profilePhoto || '';
      const finalPhoto = photo instanceof File ? photo : existingPhoto;
      onUpdateUser({ ...user, name, phone, age: parseInt(age) || 0, passportNumber: passport, status, photo: finalPhoto, profilePhoto: typeof finalPhoto === 'string' ? finalPhoto : undefined });
    }
    onClose();
  };

  const handleDelete = () => {
    if (user) onDeleteUser(user.id ?? user._id);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Avatar src={photoPreview} alt={name} sx={{ width: 100, height: 100, mb: 2, mt: 5, mx: 'auto' }} />
        <DialogTitle>Update Applicant</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" type="text" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField margin="dense" label="Phone" type="text" fullWidth required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField margin="dense" label="Age" type="number" fullWidth required value={age} onChange={(e) => setAge(e.target.value)} />
          <TextField margin="dense" label="Passport Number" type="text" fullWidth required value={passport} onChange={(e) => setPassport(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem sx={{ color: 'darkgreen' }} value="accepted">Accepted</MenuItem>
              <MenuItem sx={{ color: 'darkgray' }} value="pending">Pending</MenuItem>
              <MenuItem sx={{ color: 'darkred' }} value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ marginTop: '16px', display: 'block', fontSize: '.8em' }} onChange={handlePhotoChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Update</Button>
          <Button startIcon={<DeleteIcon />} sx={{ color: 'darkred', position: 'absolute', top: '2%', right: '2%' }} onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ============ FLOATING ACTION BUTTON ============
function FloatingActions({ onAddClick }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <Box sx={{ display: 'grid', position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Fab color="primary" aria-label="add" onClick={onAddClick} sx={{ mb: 1 }}>
        <AddIcon />
      </Fab>
    </Box>
  );
}

// ============ APPLICANT LIST ============
function ApplicantList({ users, onUpdateClick, title, loading }) {
  const [expandedId, setExpandedId] = useState(null);
  const { isAuthenticated } = useAuth();

  const handleExpandClick = (id) => setExpandedId(expandedId === id ? null : id);

  const getTitleColor = () => {
    if (title === 'Accepted Applicants') return 'green';
    if (title === 'Pending Applicants') return 'gray';
    return 'red';
  };

  const getStatusDot = () => {
    if (title === 'Accepted Applicants') return 'online';
    if (title === 'Pending Applicants') return 'gray';
    return 'offline';
  };

  const getStatusColor = () => {
    if (title === 'Accepted Applicants') return 'green';
    if (title === 'Pending Applicants') return 'gray';
    return 'darkred';
  };

  return (
    <CardContainer elevation={2} sx={{ my: 2 }}>
      <Typography variant="h5" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', color: getTitleColor(), fontWeight: 'bold' }}>
        {title}
      </Typography>
      <List sx={{ p: 0 }}>
        {users.map((u) => (
          <React.Fragment key={u.id ?? u._id}>
            <StyledListItem
              onClick={() => handleExpandClick(u.id ?? u._id)}
              secondaryAction={
                isAuthenticated && (
                  <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); onUpdateClick(u); }} sx={{ mr: '3rem', mt: '.1rem', zIndex: 9995 }}>
                    <EditIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <AvatarWrapper>
                  <Avatar src={u.photo || u.profilePhoto} alt={u.name} sx={{ width: '4rem', height: '4rem' }} />
                  <StatusDot status={getStatusDot()} />
                </AvatarWrapper>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{u.name}</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary" sx={{ color: getStatusColor() }}>
                    {(u.status || 'accepted').toUpperCase()}
                  </Typography>
                }
                sx={{ ml: 2 }}
              />
              <ExpandIconButton
                expand={expandedId === (u.id ?? u._id)}
                onClick={(e) => { e.stopPropagation(); handleExpandClick(u.id ?? u._id); }}
                aria-expanded={expandedId === (u.id ?? u._id)}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandIconButton>
            </StyledListItem>

            <Collapse in={expandedId === (u.id ?? u._id)} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2, pl: 10, pr: 4, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Passport Number:</strong> {u.passportNumber || u.passport || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Phone Number:</strong> {u.phone || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Age:</strong> {u.age || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Location:</strong> {u.location || 'Canada'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status Detail:</strong> Application verified and approved.
                </Typography>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </CardContainer>
  );
}

// ============ MAIN CONTENT ============
function MainContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { login } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applicants`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLoginSubmit = async (username, password) => {
    try {
      await login({ username, password });
      setIsLoginOpen(false);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleAddUser = async (formData) => {
    try {
      setLoading(true);
      // Convert photo File to compressed base64 if provided
      let payload = { ...formData };
      if (formData.photo instanceof File) {
        payload.photo = await compressImageFile(formData.photo);
      }
      payload.profilePhoto = payload.photo;
      const res = await api.post('/api/applicants', payload);
      if (res) {
        const newUser = res.data;
        setUsers((prev) => [newUser, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error('Add user error:', err);
      alert('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      setLoading(true);
      // Convert photo File to compressed base64 if a new file was selected
      let payload = { ...userData };
      const fallbackPhoto = userData.photo || userData.profilePhoto || selectedUser?.photo || selectedUser?.profilePhoto || '';
      if (userData.photo instanceof File) {
        payload.photo = await compressImageFile(userData.photo);
      } else if (!payload.photo || payload.photo === '') {
        payload.photo = fallbackPhoto;
      }
      payload.profilePhoto = payload.photo;
      const targetId = userData.id ?? userData._id;
      const res = await api.put(`/api/applicants/${targetId}`, payload);
      if (res.data) {
        setUsers((prev) =>
          prev.map((user) => (String(user.id ?? user._id) === String(targetId) ? res.data : user))
        );
        setIsUpdateOpen(false);
      }
    } catch (err) {
      console.error('Update user error:', err);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/applicants/${id}`);
      setUsers((prev) => prev.filter((u) => String(u.id ?? u._id) !== String(id)));
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (user) => {
    setSelectedUser(user);
    setIsUpdateOpen(true);
  };

  return (
    <Box sx={{ maxWidth: '100vw' }}>
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />

      {/* Main page wrapper with blue background */}
      <Box
        component="main"
        sx={{ overflowX: 'clip', px: 0, py: 1, bgcolor: 'rgb(0, 59, 117)', minHeight: '100svh' }}
      >
        {/* HomePage sections (hero, business, careers, etc.) */}
        <HomePage />

        {/* Applicant Lists */}
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mt: 4, mb: 2, textAlign: 'center' }}></Typography>

          <ApplicantList
            title="Accepted Applicants"
            users={users.filter((u) => u.status === 'accepted')}
            loading={loading}
            onUpdateClick={handleOpenUpdate}
          />
          <ApplicantList
            title="Pending Applicants"
            users={users.filter((u) => u.status === 'pending')}
            loading={loading}
            onUpdateClick={handleOpenUpdate}
          />
          <ApplicantList
            title="Rejected Applicants"
            users={users.filter((u) => u.status === 'rejected')}
            loading={loading}
            onUpdateClick={handleOpenUpdate}
          />
        </Container>

        {/* Audience Section (5 icons + dropdown) rendered below applicant lists */}
        <AudienceSection />
      </Box>

      {/* Footer */}
      <Footer />

      {/* Floating Add Button (admin only) */}
      <FloatingActions onAddClick={() => setIsAddOpen(true)} />

      {/* Modals */}
      <Fade in={isLoginOpen}>
        <div>
          <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLoginSubmit} />
        </div>
      </Fade>
      <Fade in={isAddOpen}>
        <div>
          <AddModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onAddUser={handleAddUser} />
        </div>
      </Fade>
      <Fade in={isUpdateOpen}>
        <div>
          <UpdateModal
            open={isUpdateOpen}
            onClose={() => { setIsUpdateOpen(false); setSelectedUser(null); }}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            user={selectedUser}
          />
        </div>
      </Fade>
    </Box>
  );
}

// ============ APP ROOT ============
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
