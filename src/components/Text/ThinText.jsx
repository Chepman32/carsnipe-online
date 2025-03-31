import React from 'react'

export default function ThinText({children, style}) {
  return (
    <p className='thinText' style={style}>{children}</p>
  )
}
