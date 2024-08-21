import React, { useEffect, useState } from 'react'
import axios from 'axios'
import * as yup from 'yup'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup.string().trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Name is required'),
  size: yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: yup.array().of(yup.string())
    .notRequired()
})


// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const getInitialValues = () => ({
  fullName: '',
  size: '',
  toppings: []
})

const getInitialErrors = () => ({
  fullName: '',
  size: '',
  toppings: []
})

export default function Form() {

  const [formEnabled, setFormEnabled] = useState(false)
  const [values, setValues] = useState(getInitialValues)
  const [errors, setErrors] = useState(getInitialErrors)
  const [serverSuccess, setServerSuccess] = useState('')
  const [serverFailure, setServerFailure] = useState('')

  useEffect(() => {
    formSchema.isValid(values).then(setFormEnabled)
  }, [values])

  const onChange = evt => {

    let {type, name, value, checked } = evt.target
    
    //value = type == 'checkbox' ? checked : value
    
    if(type === 'checkbox'){
      if(name === 'toppings'){
        if(checked){ //Add the topping to the array if checked
          setValues({...values, toppings: [...values.toppings, value]})
        }else{ //Remove the topping from the array if unchecked
          setValues({...values, toppings: values.toppings.filter(id => id !== value)})
        }
      }
    }else{
      //Handle other input types
      setValues({...values, [name]: value})
    }

    yup.reach(formSchema, name).validate(value)
      .then(() => setErrors({...errors, [name]: ''}))
      .catch((err) => setErrors({ ...errors, [name]: err.errors[0] }))

    //console.log('it works')
    //console.log(values)

  }

  const buildConfirmationStr = (values) => {

    //Setting string for correct output
    let str = `Thank you for your order, ${values.fullName}!`
    let size = ''
    let topp = 'toppings'

    if(values.size == 'S'){
      size = 'small'
    }else if(values.size == 'M'){
      size = 'medium'
    }else{
      size = 'large'
    }

    if(values.toppings.length === 1){
      topp = 'topping'
    }

    if(!values.toppings.length){
      str += ` Your ${size} pizza with no ${topp} is on the way.`
    }else{
      str += ` Your ${size} pizza with ${values.toppings.length} ${topp} is on the way.`
    }

    return str;
  }

  const onSubmit = evt => {

    //prevent page from realoading when clicking submit button
    evt.preventDefault()

    const message = buildConfirmationStr(values)

    axios.post('http://localhost:9009/api/order', values)
      .then(res => {
        setServerSuccess(message)//res.data.messsage)
        setServerFailure()
        setValues(getInitialValues())
      })
      .catch(err => {
        setServerFailure(err.response.data.message)
        setServerSuccess()
      })
  }
  //!Thank you for your order! Something went wrong
  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className='success'>{serverSuccess}</div>}
      {serverFailure && <div className='failure'>{serverFailure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input 
            placeholder="Type full name" 
            id="fullName" 
            type="text" 
            name="fullName" 
            value={values.fullName} 
            onChange={onChange}
          />
        </div>
        { errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" name="size" value={values.size} onChange={onChange}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            {/* Fill out the missing options */}
          </select>
        </div>
        { errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {
         toppings.map(topp => ( 
          <label key={topp.topping_id}>
            <input
              name="toppings"
              id={`topping-${topp.topping_id}`}
              type="checkbox"
              value={topp.topping_id}
              checked={values.toppings.includes(topp.topping_id)} //== topp.text}
              onChange={onChange}
            />
            {topp.text}<br />
          </label>
         ))
        } 
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input disabled={!formEnabled} type="submit" />
    </form>
  )
}
