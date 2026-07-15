const TableSelector = ({ selectedTable, onTableChange }) => {
  const tables = [
    { id: 'round', label: 'Table Round', size: [3.5, 0.1, 3.5] },
    { id: 'a-short', label: 'Table A Short', size: [4, 0.1, 2.5] },
    { id: 'a-long', label: 'Table A Long', size: [5, 0.1, 2.5] },
    { id: 'b-short', label: 'Table B Short', size: [3, 0.1, 3] },
    { id: 'b-long', label: 'Table B Long', size: [4.5, 0.1, 3] }
  ]

  return (
    <div className="table-selector">
      <label>Table Style</label>
      <div className="table-buttons">
        {tables.map((table) => (
          <button
            key={table.id}
            className={`table-btn ${selectedTable === table.id ? 'active' : ''}`}
            onClick={() => onTableChange(table.id, table.size)}
            title={table.label}
          >
            {table.label.split(' ')[1]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TableSelector
