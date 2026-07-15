const CameraControls = ({ cameraPreset, onPresetChange, aspectRatio, onAspectRatioChange }) => {
  const elevations = [0, 15, 30, 45, 90]
  const azimuths = [-60, -30, 0, 30, 60]
  const azimuthLabels = ['Far Left', 'Med Left', 'Center', 'Med Right', 'Far Right']
  const focalLengths = ['wide', 'medium', 'tight']

  const handleElevation = (elev) => {
    onPresetChange({ ...cameraPreset, elevation: elev })
  }

  const handleAzimuth = (azim) => {
    onPresetChange({ ...cameraPreset, azimuth: azim })
  }

  const handleDutch = (e) => {
    onPresetChange({ ...cameraPreset, dutch: parseFloat(e.target.value) })
  }

  const handleFocal = (focal) => {
    onPresetChange({ ...cameraPreset, focal })
  }

  const aspectRatios = ['Open', '16:9', '21:9', '4:3', '1:1', '9:16', '2.35:1', '1.85:1']

  return (
    <div className="camera-controls">
      <div className="control-group">
        <label>Elevation</label>
        <div className="button-row">
          {elevations.map((elev) => (
            <button
              key={elev}
              className={`preset-btn ${cameraPreset.elevation === elev ? 'active' : ''}`}
              onClick={() => handleElevation(elev)}
            >
              {elev}°
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Azimuth</label>
        <div className="button-row">
          {azimuths.map((azim, idx) => (
            <button
              key={azim}
              className={`preset-btn ${cameraPreset.azimuth === azim ? 'active' : ''}`}
              onClick={() => handleAzimuth(azim)}
              title={azimuthLabels[idx]}
            >
              {azimuthLabels[idx]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Dutch Angle: {cameraPreset.dutch}°</label>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={cameraPreset.dutch}
          onChange={handleDutch}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>Focal Length</label>
        <div className="button-row">
          {focalLengths.map((focal) => (
            <button
              key={focal}
              className={`preset-btn ${cameraPreset.focal === focal ? 'active' : ''}`}
              onClick={() => handleFocal(focal)}
            >
              {focal.charAt(0).toUpperCase() + focal.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Aspect Ratio</label>
        <div className="button-row">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              className={`preset-btn ${aspectRatio === ratio ? 'active' : ''}`}
              onClick={() => onAspectRatioChange(ratio)}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CameraControls
