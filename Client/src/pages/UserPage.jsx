import { useEffect, useState } from "react";

export const UserPage = () =>{
    const [users, setUsers] = useState([]);

    useEffect(()=>{
        fetch('http://localhost:3000/api/users').then((response)=>{
          return response.json()
        }).then((data)=>{
            if(data.length>0){
                setUsers(data);
            }
        })
    },[])
    return (
        <div>
      <h1>User List</h1>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.age}</td>
              <td>{user.gender}</td>
              <td>{user.gpa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}