import React, { useState } from 'react';
import { useStore } from '../store';
import Icon from '../icons';
import DishArt from '../DishArt';
import { useToast } from '../ui';

export default function Login({ onLogin, onRegister }) {
  const { state } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('client');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const demoClients = state.users.filter((user) => user.role === 'client').slice(0, 2);
  const admin = state.users.find((user) => user.role === 'admin');
  const pickup = state.orders
    .filter((order) => order.status === 'listo' && order.type !== 'mesa')
    .slice(0, 2);

  const submit = (event) => {
    event.preventDefault();
    setError('');
    const clean = email.trim().toLowerCase();
    const user = state.users.find((candidate) => candidate.email.toLowerCase() === clean);
    if (!user || user.password !== password) {
      setError('Email o contraseña incorrectos. Revisá los datos demo.');
      return;
    }
    if (tab === 'admin' && user.role !== 'admin') {
      setError('Esa cuenta es de cliente. Ingresá desde la pestaña Cliente.');
      return;
    }
    if (tab === 'client' && user.role === 'admin') {
      setError('Esa cuenta es del equipo. Ingresá desde la pestaña Equipo.');
      return;
    }
    onLogin(user);
    toast(`¡Hola, ${user.name.split(' ')[0]}!`, { tone: 'success', icon: 'spark' });
  };

  const submitRegister = (event) => {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Contanos tu nombre para crear la cuenta.');
      return;
    }
    if (!email.includes('@')) {
      setError('Ingresá un email válido.');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña necesita al menos 4 caracteres.');
      return;
    }
    try {
      const user = onRegister({ name: name.trim(), email, password, phone });
      toast(`Cuenta creada. ¡Bienvenido, ${user.name.split(' ')[0]}!`, { tone: 'success', icon: 'spark' });
    } catch (registerError) {
      setError(registerError.message || 'No pudimos crear la cuenta.');
    }
  };

  const quickLogin = (user) => {
    onLogin(user);
    toast(`Entraste como ${user.name.split(' ')[0]}`, { tone: 'success', icon: 'spark' });
  };

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-visual-top">
          <div className="brand-lockup brand-lockup-light">
            <span className="brand-mark">m</span>
            <div>
              <b>miga</b>
              <small>bueno, rápido y con amor</small>
            </div>
          </div>
          <span className="login-open">
            <i /> Abierto ahora
          </span>
        </div>

        <div className="login-visual-copy">
          <span className="eyebrow light">Cocina de barrio · desde 1998</span>
          <h1>
            Pedí, seguí y
            <br />
            disfrutá <em>tu pedido.</em>
          </h1>
          <p>
            Un solo lugar para el salón, el retiro y el envío. Cliente y equipo, cada uno con su
            propia vista.
          </p>
        </div>

        <div className="login-visual-art">
          <DishArt kind="combo" accent="#e0a13a" />
          <div className="login-float login-float-ticket">
            <span>Turno listo</span>
            <strong>{pickup[0]?.code || 'A-105'}</strong>
            <small>{pickup[0]?.customerName || 'Mateo Ferrer'}</small>
          </div>
          <div className="login-float login-float-note">
            <Icon name="clock" size={16} />
            <div>
              <b>2 min</b>
              <small>y pasa a cocina</small>
            </div>
          </div>
          <div className="login-stamp">
            HECHO
            <br />
            CON AMOR
          </div>
        </div>

        <div className="login-marquee">
          <span>Salón</span>
          <i>✳</i>
          <span>Retiro con turno</span>
          <i>✳</i>
          <span>Envío a domicilio</span>
          <i>✳</i>
          <span>Pago como quieras</span>
          <i>✳</i>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-tabs">
            <button
              type="button"
              className={tab === 'client' ? 'is-active' : ''}
              onClick={() => {
                setTab('client');
                setMode('login');
                setError('');
              }}
            >
              <Icon name="user" size={15} /> Soy cliente
            </button>
            <button
              type="button"
              className={tab === 'admin' ? 'is-active' : ''}
              onClick={() => {
                setTab('admin');
                setMode('login');
                setError('');
              }}
            >
              <Icon name="chef" size={15} /> Soy del equipo
            </button>
          </div>

          {tab === 'client' && mode === 'register' ? (
            <>
              <div className="login-heading">
                <span className="eyebrow">Tu cuenta Miga</span>
                <h2>Creá tu cuenta.</h2>
                <p>Tus pedidos, tus tickets y tus reclamos en un solo lugar.</p>
              </div>
              <form className="login-form" onSubmit={submitRegister}>
                <label>
                  <span>Nombre y apellido</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sofía Duarte"
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vos@email.com"
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Teléfono <small>opcional</small></span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="11 5555 0000"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    autoComplete="new-password"
                  />
                </label>
                {error && (
                  <p className="form-error">
                    <Icon name="alert" size={15} /> {error}
                  </p>
                )}
                <button className="btn btn-ink btn-block" type="submit">
                  Crear mi cuenta <Icon name="arrowRight" size={16} />
                </button>
                <button
                  type="button"
                  className="login-link"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Ya tengo cuenta · Iniciar sesión
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-heading">
                <span className="eyebrow">{tab === 'admin' ? 'Panel de administración' : 'Bienvenido de nuevo'}</span>
                <h2>{tab === 'admin' ? 'El equipo, adelante.' : 'Tu mesa te espera.'}</h2>
                <p>
                  {tab === 'admin'
                    ? 'Pedidos, salón, reclamos y carta en un mismo tablero.'
                    : 'Ingresá para ver sólo tus pedidos, tickets y reclamos.'}
                </p>
              </div>

              <form className="login-form" onSubmit={submit}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={tab === 'admin' ? 'admin@miga.com' : 'sofia@miga.com'}
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </label>
                {error && (
                  <p className="form-error">
                    <Icon name="alert" size={15} /> {error}
                  </p>
                )}
                <button className="btn btn-ink btn-block" type="submit">
                  Ingresar <Icon name="arrowRight" size={16} />
                </button>
                {tab === 'client' && (
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                  >
                    ¿Primera vez? Crear cuenta
                  </button>
                )}
              </form>

              <div className="login-demo">
                <div className="login-demo-title">
                  <span>Acceso rápido de demo</span>
                  <i />
                </div>
                {tab === 'client' ? (
                  <div className="login-demo-grid">
                    {demoClients.map((user) => (
                      <button type="button" key={user.id} onClick={() => quickLogin(user)}>
                        <span className="demo-avatar">{user.name.charAt(0)}</span>
                        <span>
                          <b>{user.name}</b>
                          <small>{user.email}</small>
                        </span>
                        <Icon name="arrowUpRight" size={14} />
                      </button>
                    ))}
                  </div>
                ) : (
                  admin && (
                    <button type="button" className="login-admin-quick" onClick={() => quickLogin(admin)}>
                      <span className="demo-avatar is-admin">
                        <Icon name="chef" size={17} />
                      </span>
                      <span>
                        <b>{admin.name} · Administración</b>
                        <small>
                          {admin.email} · contraseña <code>{admin.password}</code>
                        </small>
                      </span>
                      <Icon name="arrowUpRight" size={15} />
                    </button>
                  )
                )}
                <p className="login-demo-note">
                  <Icon name="lock" size={13} /> Prototipo local: los datos se guardan en este navegador.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="login-foot">
          Miga · {state.settings.address} · {state.settings.hours}
        </p>
      </section>
    </div>
  );
}
