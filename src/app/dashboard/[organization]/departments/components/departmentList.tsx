"use client"

import React, { useEffect, useState } from 'react';
import { getAllDepartments } from '../crud';
import { Department } from '../types';
import DepartmentComponent from './department';

const DepartmentList = () => {
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [effect, setEffect] = useState(Math.random() * 100);
  const imagePlaceholder = 'https://www.shutterstock.com/image-vector/line-cloud-logo-icon-260nw-1033660648.jpg'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDepartments();
        setAllDepartments(data || []); // Ensure data is not null before setting state
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <div
    className={
      'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' +
      ' 2xl:grid-cols-4'
    }
  >
        {allDepartments.map((department) => (
          <DepartmentComponent key={department.id}
            name = {department.name}
            id = {department.id}
            imageUrl = {department.image_url || imagePlaceholder}
            dateCreated = {department.created_at}
            setEffect={setEffect}
          />
        ))}
    </div>
  );
};

export default DepartmentList;
