import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeCrudModal, saveCrudModalItem, addToast } from '../features/FitnessSlice';

const CrudModal = () => {
  const dispatch = useDispatch();
  const { crudModal } = useSelector((state) => state.fitness);
  const { isOpen, type, item } = crudModal;

  // Bill Form state
  const [billCustomer, setBillCustomer] = useState('Alex Smith');
  const [billEmail, setBillEmail] = useState('alex@fitpulse.io');
  const [billItems, setBillItems] = useState('1x Performance Training Shirt');
  const [billTotal, setBillTotal] = useState('25.00');
  const [billStatus, setBillStatus] = useState('Paid');

  // User Form state
  const [userUsername, setUserUsername] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('Member');

  // Workout Form state
  const [wktTitle, setWktTitle] = useState('');
  const [wktCategory, setWktCategory] = useState('Upper Body');
  const [wktDiff, setWktDiff] = useState('Medium');
  const [wktDur, setWktDur] = useState('40 mins');
  const [wktExercises, setWktExercises] = useState('');

  // T-Shirt Form state
  const [teeTitle, setTeeTitle] = useState('');
  const [teePrice, setTeePrice] = useState('24.00');
  const [teeStock, setTeeStock] = useState('20');
  const [teeColor, setTeeColor] = useState('Black');
  const [teeImg, setTeeImg] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500');
  const [teeDesc, setTeeDesc] = useState('Training workout shirt');

  // Record Form state
  const [recName, setRecName] = useState('Alex Smith');
  const [recHeight, setRecHeight] = useState('175');
  const [recWeight, setRecWeight] = useState('70');
  const [recCal, setRecCal] = useState('2300');
  const [recSteps, setRecSteps] = useState('10000');

  useEffect(() => {
    if (type === 'bills') {
      if (item) {
        setBillCustomer(item.customerName || '');
        setBillEmail(item.email || '');
        setBillItems(item.items || '');
        setBillTotal(item.total ? item.total.toString() : '25.00');
        setBillStatus(item.status || 'Paid');
      } else {
        setBillCustomer('Alex Smith');
        setBillEmail('alex@fitpulse.io');
        setBillItems('1x Performance Training Shirt');
        setBillTotal('25.00');
        setBillStatus('Paid');
      }
    } else if (type === 'users') {
      if (item) {
        setUserUsername(item.username || item.name || '');
        setUserName(item.name || item.username || '');
        setUserEmail(item.email || '');
        setUserPhone(item.phone || '');
        setUserRole(item.role || 'Member');
      } else {
        setUserUsername('');
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        setUserRole('Member');
      }
    } else if (type === 'workouts') {
      if (item) {
        setWktTitle(item.title || '');
        setWktCategory(item.category || 'Upper Body');
        setWktDiff(item.difficulty || 'Medium');
        setWktDur(item.duration || '40 mins');
        setWktExercises(item.exercises || '');
      } else {
        setWktTitle('');
        setWktCategory('Upper Body');
        setWktDiff('Medium');
        setWktDur('40 mins');
        setWktExercises('');
      }
    } else if (type === 'tshirts') {
      if (item) {
        setTeeTitle(item.title || '');
        setTeePrice(item.price ? item.price.toString() : '24.00');
        setTeeStock(item.stock ? item.stock.toString() : '20');
        setTeeColor(item.color || 'Black');
        setTeeImg(item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500');
        setTeeDesc(item.desc || 'Training workout shirt');
      } else {
        setTeeTitle('');
        setTeePrice('24.00');
        setTeeStock('20');
        setTeeColor('Black');
        setTeeImg('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500');
        setTeeDesc('Training workout shirt');
      }
    } else if (type === 'records') {
      if (item) {
        setRecName(item.name || 'Alex Smith');
        setRecHeight(item.height ? item.height.toString() : '175');
        setRecWeight(item.weight ? item.weight.toString() : '70');
        setRecCal(item.calories ? item.calories.toString() : '2300');
        setRecSteps(item.steps ? item.steps.toString() : '10000');
      } else {
        setRecName('Alex Smith');
        setRecHeight('175');
        setRecWeight('70');
        setRecCal('2300');
        setRecSteps('10000');
      }
    }
  }, [type, item]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(closeCrudModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let dataToSave = {};
    if (type === 'bills') {
      dataToSave = {
        customerName: billCustomer.trim(),
        email: billEmail.trim(),
        items: billItems.trim(),
        total: parseFloat(billTotal) || 0,
        status: billStatus,
        date: item?.date || new Date().toISOString().split('T')[0]
      };
    } else if (type === 'users') {
      dataToSave = {
        username: userUsername.trim(),
        name: userName.trim() || userUsername.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
        role: userRole
      };
    } else if (type === 'workouts') {
      dataToSave = {
        title: wktTitle.trim(),
        category: wktCategory,
        difficulty: wktDiff,
        duration: wktDur.trim(),
        exercises: wktExercises.trim()
      };
    } else if (type === 'tshirts') {
      dataToSave = {
        title: teeTitle.trim(),
        price: parseFloat(teePrice) || 20,
        stock: parseInt(teeStock, 10) || 10,
        color: teeColor.trim(),
        image: teeImg.trim(),
        desc: teeDesc.trim()
      };
    } else if (type === 'records') {
      const h = parseFloat(recHeight) || 175;
      const w = parseFloat(recWeight) || 70;
      dataToSave = {
        name: recName.trim(),
        height: h,
        weight: w,
        calories: parseInt(recCal, 10) || 2300,
        steps: parseInt(recSteps, 10) || 10000,
        bmi: parseFloat((w / ((h / 100) * (h / 100))).toFixed(1)),
        date: item?.date || new Date().toISOString().split('T')[0]
      };
    }

    try {
      await dispatch(
        saveCrudModalItem({
          type,
          editId: item ? item.id : null,
          data: dataToSave
        })
      ).unwrap();

      dispatch(closeCrudModal());
      dispatch(addToast('Record saved'));
    } catch (err) {
      alert('Error saving: ' + (err.message || 'Server error'));
    }
  };

  const getTitle = () => {
    if (type === 'bills') return item ? 'Edit Bill / Invoice' : 'Create New Bill / Invoice';
    if (type === 'users') return item ? 'Edit User' : 'Add User';
    if (type === 'workouts') return item ? 'Edit Workout' : 'Add Workout';
    if (type === 'tshirts') return item ? 'Edit T-Shirt' : 'Add T-Shirt';
    if (type === 'records') return item ? 'Edit Record' : 'Add Record';
    return 'Modal';
  };

  return (
    <div
      id="crudModal"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 transition-opacity"
    >
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span id="modalTitle" className="font-bold text-xs text-slate-900">
            {getTitle()}
          </span>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-black cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <form id="crudForm" onSubmit={handleSubmit} className="p-4 space-y-3">
          <div id="modalFormFields" className="space-y-3">
            {/* BILLS FIELDS */}
            {type === 'bills' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={billCustomer}
                    onChange={(e) => setBillCustomer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={billEmail}
                    onChange={(e) => setBillEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Items Description</label>
                  <input
                    type="text"
                    required
                    value={billItems}
                    onChange={(e) => setBillItems(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Total Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={billTotal}
                      onChange={(e) => setBillTotal(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Payment Status</label>
                    <select
                      value={billStatus}
                      onChange={(e) => setBillStatus(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* USERS FIELDS */}
            {type === 'users' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs flat-input cursor-pointer"
                  >
                    <option value="Member">Member</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {/* WORKOUTS FIELDS */}
            {type === 'workouts' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Workout Title</label>
                  <input
                    type="text"
                    required
                    value={wktTitle}
                    onChange={(e) => setWktTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Category</label>
                    <select
                      value={wktCategory}
                      onChange={(e) => setWktCategory(e.target.value)}
                      className="w-full px-1 py-1.5 text-xs flat-input cursor-pointer"
                    >
                      <option value="Upper Body">Upper</option>
                      <option value="Lower Body">Lower</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Difficulty</label>
                    <select
                      value={wktDiff}
                      onChange={(e) => setWktDiff(e.target.value)}
                      className="w-full px-1 py-1.5 text-xs flat-input cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={wktDur}
                      onChange={(e) => setWktDur(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Exercises</label>
                  <textarea
                    rows="3"
                    required
                    value={wktExercises}
                    onChange={(e) => setWktExercises(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs flat-input"
                  />
                </div>
              </>
            )}

            {/* T-SHIRTS FIELDS */}
            {type === 'tshirts' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Shirt Title</label>
                  <input
                    type="text"
                    required
                    value={teeTitle}
                    onChange={(e) => setTeeTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={teePrice}
                      onChange={(e) => setTeePrice(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={teeStock}
                      onChange={(e) => setTeeStock(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Color</label>
                    <input
                      type="text"
                      required
                      value={teeColor}
                      onChange={(e) => setTeeColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Photo URL</label>
                  <input
                    type="url"
                    required
                    value={teeImg}
                    onChange={(e) => setTeeImg(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs flat-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={teeDesc}
                    onChange={(e) => setTeeDesc(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs flat-input"
                  />
                </div>
              </>
            )}

            {/* RECORDS FIELDS */}
            {type === 'records' && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Member Name</label>
                  <input
                    type="text"
                    required
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs flat-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      value={recHeight}
                      onChange={(e) => setRecHeight(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      value={recWeight}
                      onChange={(e) => setRecWeight(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Calories</label>
                    <input
                      type="number"
                      value={recCal}
                      onChange={(e) => setRecCal(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Steps</label>
                    <input
                      type="number"
                      value={recSteps}
                      onChange={(e) => setRecSteps(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs flat-input"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-slate-200 text-xs font-medium flat-btn hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flat-btn cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;

