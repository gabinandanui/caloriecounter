import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import DeleteIcon from '@mui/icons-material/Delete';
import eatingGif from '../assets/eatcat.gif';
const TodayHistory = ( {intakeHistory}) => {
  const getNutrientIcon = (type) => {
    const normalized = type.toLowerCase();
    if (normalized === 'calories') return '🔥';
    if (normalized === 'carbs') return '🍞'; // Changed from 'carbohydrates'
    if (normalized === 'protein') return '💪';
    if (normalized === 'fats') return '🥑'; // Changed from 'fat' to match your data
    if (normalized === 'fiber') return '🌾';
    return '🥤';
  };
  return (
    <>
      <Card sx={{
        minWidth: 275, borderRadius: 4, borderLeft: "4px solid #2196f3",
        background: 'rgba(29, 78, 216, 0.15)',
        marginTop: '20px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <CardContent>
          {intakeHistory && intakeHistory.length > 0 ? (
            <div>
              <h2 className='text-white text-left font-semibold'>Intake History</h2>

              {intakeHistory.foodEntries.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
                <Card sx={{
                  minWidth: 275, border: "1px solid #2196f3",
                  background: 'rgba(29, 78, 216, 0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginTop: '8px'
                }} key={item.id}>
                  <span className='text-left flex mr-auto text-white items-center'>
                    <span className="animate-pulse mr-2">{item.food_info?.icon}</span>
                    {item.quantity} {item.measurement} of {item.food_name}

                    <span className="ml-auto">

                      {/* [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ['fiber',0] ]
                      ↓ filter out zero
                      [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ]
                      ↓ map to icons
                      [ 🔥 , 💪 , 🍞 , 🥑 ] */}
                      {item.nutrition &&
                        Object.entries(item.nutrition) // 1. Convert object to array: [['calories', 16], ['carbs', 2.6], ...]
                          .filter(([, val]) => val > 0) // 2. Keep only items with value > 0 food_type
                          .map(([nutrient, val]) => ( // 3. Map the filtered array to show icons
                            <span key={nutrient} title={String(val + 'g')} className="mr-2 cursor-pointer">
                              {getNutrientIcon(nutrient)}
                            </span>
                          ))}
                    </span>
                  </span>
                  <span className='text-left flex mr-auto text-white'>
                    {item.dateTime.split(' ')[0] + ' ' + item.dateTime.split(' ')[1]}
                    <span className='text-left flex ml-auto text-white'>
                      <DeleteIcon color="error" fontSize="small"  />
                    </span>
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <p className='text-white text-left font-semibold'> <span className="animate-pulse">No intake history available, Eat some food! </span> 
            <img className="mt-5 mx-auto" style={{ width: "240px"}} src={eatingGif} alt="Empty" /></p>
          )}
        </CardContent>
        <CardActions>
        </CardActions>
      </Card>


    </>
  )
}

export default TodayHistory