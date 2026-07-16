import { useState } from 'react'
import '../styles/CategoryPicker.css'

const CATEGORIES = {
  tables: {
    icon: '🏠',
    label: 'TABLE',
    items: ['wood-table', 'marble-table', 'glass-table'],
    isTable: true
  },
  tableware: {
    icon: '🍽️',
    label: 'Tableware',
    items: ['plate', 'bowl', 'napkin']
  },
  drinkware: {
    icon: '☕',
    label: 'Drinkware',
    items: ['glass', 'mug', 'wine-glass']
  },
  flatware: {
    icon: '🥄',
    label: 'Flatware',
    items: ['fork', 'knife', 'spoon']
  },
  furniture: {
    icon: '🪑',
    label: 'Furniture',
    items: ['chair', 'candle', 'vase']
  },
  shapes: {
    icon: '◻️',
    label: 'Shapes',
    items: ['cube', 'sphere', 'cylinder']
  }
}

const CategoryPicker = ({ onSelectItem, getCategoryCount }) => {
  const [expandedCategory, setExpandedCategory] = useState(null)

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const handleSelectItem = (category, item) => {
    onSelectItem(category, item)
    setExpandedCategory(null)
  }

  return (
    <div className="category-picker">
      {/* Main category buttons */}
      <div className="category-buttons">
        {Object.entries(CATEGORIES).map(([key, { icon, label }]) => (
          <button
            key={key}
            className={`category-btn ${expandedCategory === key ? 'active' : ''}`}
            onClick={() => toggleCategory(key)}
            title={label}
          >
            <span className="category-icon">{icon}</span>
          </button>
        ))}
      </div>

      {/* Expanded sub-picker */}
      {expandedCategory && (
        <div className="sub-picker">
          <div className="sub-picker-header">
            <span>{CATEGORIES[expandedCategory].label}</span>
            <button className="close-btn" onClick={() => setExpandedCategory(null)}>✕</button>
          </div>
          <div className="sub-picker-items">
            {CATEGORIES[expandedCategory].items.map((item) => {
              const count = getCategoryCount(expandedCategory, item)
              return (
                <button
                  key={item}
                  className="sub-picker-item"
                  onClick={() => handleSelectItem(expandedCategory, item)}
                >
                  <span className="item-name">{item}</span>
                  <span className="item-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPicker
