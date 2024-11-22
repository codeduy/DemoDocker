import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export const HomePage = ()=>{
   
    return (
        <>
        <Link to="/users" >
        To users
        </Link>
        </>
    )
}