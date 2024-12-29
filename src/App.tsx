import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Check, Trash2, CreditCard, LogOut } from 'lucide-react';
import './index.css';


// Constants
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const PAYMENT_STATUS = { PENDING: 'PENDIENTE', PAID: 'PAGADO' };
const FREQUENCY_TYPES = { ONCE: 'UNA_VEZ', MONTHLY: 'MENSUAL' };
const FORTNIGHT_OPTIONS = { Q1: 'Q1', Q2: 'Q2', BOTH: 'Q1yQ2' };
const PAYMENT_METHODS = { TC: 'Tarjeta de Crédito', DEBIT: 'Débito' };

// Storage Helper
const Storage = {
  savePayments: (userId, payments) => localStorage.setItem(`payments_${userId}`, JSON.stringify(payments)),
  getPayments: (userId) => JSON.parse(localStorage.getItem(`payments_${userId}`) || '[]'),
  saveUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
  getUser: () => JSON.parse(localStorage.getItem('currentUser') || 'null'),
  clearUser: () => localStorage.removeItem('currentUser')
};

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (credentials.username === 'admin' && credentials.password === '123456') {
      const user = { id: 1, username: credentials.username };
      Storage.saveUser(user);
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Control de Pagos - Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Usuario"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleLogin} className="w-full">Iniciar Sesión</Button>
            <div className="text-center text-sm text-gray-500">
              <p>Usuario: admin</p>
              <p>Contraseña: 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentControlApp = () => {
  const [user, setUser] = useState(Storage.getUser());
  const [payments, setPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedFortnight, setSelectedFortnight] = useState('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');
  const [newPayment, setNewPayment] = useState({
    concept: '',
    amount: '',
    month: 0,
    frequency: FREQUENCY_TYPES.ONCE,
    fortnight: FORTNIGHT_OPTIONS.Q1,
    paymentMethod: 'TC'
  });

  useEffect(() => {
    if (user) {
      setPayments(Storage.getPayments(user.id));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Storage.savePayments(user.id, payments);
    }
  }, [payments, user]);

  const handleLogout = () => {
    Storage.clearUser();
    setUser(null);
  };

  if (!user) return <LoginForm onLogin={setUser} />;

  const handleAddPayment = () => {
    if (!newPayment.concept || !newPayment.amount) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const schedules = [];
    if (newPayment.frequency === FREQUENCY_TYPES.ONCE) {
      schedules.push({
        ...newPayment,
        id: Date.now(),
        status: PAYMENT_STATUS.PENDING,
        month: parseInt(newPayment.month)
      });
    } else {
      for (let month = 0; month < 12; month++) {
        if (newPayment.fortnight === FORTNIGHT_OPTIONS.Q1 || newPayment.fortnight === FORTNIGHT_OPTIONS.BOTH) {
          schedules.push({
            ...newPayment,
            id: Date.now() + month,
            status: PAYMENT_STATUS.PENDING,
            month,
            fortnight: 'Q1'
          });
        }
        if (newPayment.fortnight === FORTNIGHT_OPTIONS.Q2 || newPayment.fortnight === FORTNIGHT_OPTIONS.BOTH) {
          schedules.push({
            ...newPayment,
            id: Date.now() + month + 100,
            status: PAYMENT_STATUS.PENDING,
            month,
            fortnight: 'Q2'
          });
        }
      }
    }
    
    setPayments([...payments, ...schedules]);
    setNewPayment({
      concept: '',
      amount: '',
      month: 0,
      frequency: FREQUENCY_TYPES.ONCE,
      fortnight: FORTNIGHT_OPTIONS.Q1,
      paymentMethod: 'TC'
    });
  };

  const filteredPayments = payments.filter(payment => {
    return payment.month === selectedMonth &&
           (selectedFortnight === 'ALL' || payment.fortnight === selectedFortnight) &&
           (selectedPaymentMethod === 'ALL' || payment.paymentMethod === selectedPaymentMethod);
  });

  const totals = filteredPayments.reduce((acc, payment) => ({
    total: acc.total + parseFloat(payment.amount),
    tc: payment.paymentMethod === 'TC' ? acc.tc + parseFloat(payment.amount) : acc.tc,
    debit: payment.paymentMethod === 'DEBIT' ? acc.debit + parseFloat(payment.amount) : acc.debit
  }), { total: 0, tc: 0, debit: 0 });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bienvenido, {user.username}</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Concepto"
              value={newPayment.concept}
              onChange={(e) => setNewPayment({...newPayment, concept: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Monto (COP)"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            />
            <select
              className="w-full p-2 border rounded"
              value={newPayment.frequency}
              onChange={(e) => setNewPayment({...newPayment, frequency: e.target.value})}
            >
              <option value={FREQUENCY_TYPES.ONCE}>Una vez</option>
              <option value={FREQUENCY_TYPES.MONTHLY}>Mensual</option>
            </select>

            {newPayment.frequency === FREQUENCY_TYPES.ONCE ? (
              <>
                <select
                  className="w-full p-2 border rounded"
                  value={newPayment.month}
                  onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
                >
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  className="w-full p-2 border rounded"
                  value={newPayment.fortnight}
                  onChange={(e) => setNewPayment({...newPayment, fortnight: e.target.value})}
                >
                  <option value={FORTNIGHT_OPTIONS.Q1}>Primera Quincena</option>
                  <option value={FORTNIGHT_OPTIONS.Q2}>Segunda Quincena</option>
                </select>
              </>
            ) : (
              <select
                className="w-full p-2 border rounded"
                value={newPayment.fortnight}
                onChange={(e) => setNewPayment({...newPayment, fortnight: e.target.value})}
              >
                <option value={FORTNIGHT_OPTIONS.Q1}>Primera Quincena</option>
                <option value={FORTNIGHT_OPTIONS.Q2}>Segunda Quincena</option>
                <option value={FORTNIGHT_OPTIONS.BOTH}>Ambas Quincenas</option>
              </select>
            )}

            <select
              className="w-full p-2 border rounded"
              value={newPayment.paymentMethod}
              onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
            >
              <option value="TC">Tarjeta de Crédito</option>
              <option value="DEBIT">Débito</option>
            </select>

            <Button onClick={handleAddPayment} className="w-full">
              Agregar Pago
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagos Programados</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <select
                className="p-2 border rounded"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <select
                className="p-2 border rounded"
                value={selectedFortnight}
                onChange={(e) => setSelectedFortnight(e.target.value)}
              >
                <option value="ALL">Todas las quincenas</option>
                <option value="Q1">Primera Quincena</option>
                <option value="Q2">Segunda Quincena</option>
              </select>
              <select
                className="p-2 border rounded"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="ALL">Todos los medios de pago</option>
                <option value="TC">Tarjeta de Crédito</option>
                <option value="DEBIT">Débito</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-bold">{payment.concept}</h3>
                    <p className="text-sm text-gray-600">
                      {`${MONTHS[payment.month]} 2025 - ${payment.fortnight}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm text-gray-600">
                        {PAYMENT_METHODS[payment.paymentMethod]}
                      </span>
                    </div>
                    <p className="font-semibold mt-1">
                      ${parseInt(payment.amount).toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={payment.status === PAYMENT_STATUS.PAID ? 'text-green-500' : 'text-yellow-500'}>
                      {payment.status}
                    </span>
                    <Button
                      variant={payment.status === PAYMENT_STATUS.PAID ? "outline" : "default"}
                      onClick={() => setPayments(payments.map(p => 
                        p.id === payment.id 
                          ? {...p, status: p.status === PAYMENT_STATUS.PAID ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID}
                          : p
                      ))}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que deseas eliminar este pago?')) {
                          setPayments(payments.filter(p => p.id !== payment.id));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredPayments.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-bold">TC: ${totals.tc.toLocaleString('es-CO')} COP</p>
                  <p className="font-bold">Débito: ${totals.debit.toLocaleString('es-CO')} COP</p>
                  <p className="text-right font-bold text-lg border-t pt-2">
                    Total {selectedFortnight !== 'ALL' ? `${selectedFortnight}` : ''}: 
                    ${totals.total.toLocaleString('es-CO')} COP
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentControlApp;
