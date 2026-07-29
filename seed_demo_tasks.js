const API_KEY = process.env.GEMINI_API_KEY || '';
const API_URL = 'https://nyxa.vercel.app/api/tasks';

async function seed() {
  console.log('Fetching a valid provider_id from the live database...');
  let providerId = '00000000-0000-0000-0000-000000000000';
  
  try {
    const userRes = await fetch(API_URL + '?get_user=true');
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData.provider_id) {
        providerId = userData.provider_id;
        console.log('Found provider_id:', providerId);
      }
    }
  } catch (e) {
    console.error('Failed to get provider_id:', e);
  }

  const tasks = [
    {
      provider_id: providerId,
      title: 'Full Market Research Report',
      description: 'Comprehensive market analysis including competitor benchmarks, target audience demographics, and growth opportunities.',
      price: 150,
      class: 'Business',
      kind: 'Market Research',
      dubs: ['}marketing', '}research', '}analysis'],
      inputs_required: { industry: 'string', focus: 'string' },
      outputs_delivered: { report: 'pdf', data: 'csv' },
      delivery_time: '3 days',
      hosting_method: 'native',
      hosting_url: 'https://nyxa.vercel.app',
      status: 'active'
    },
    {
      provider_id: providerId,
      title: 'Generate Custom Study Plan',
      description: 'A tailored 4-week study plan based on your current knowledge gaps and exam goals.',
      price: 25,
      class: 'Education',
      kind: 'Study Plans',
      dubs: ['}education', '}planning', '}study'],
      inputs_required: { subject: 'string', examDate: 'string' },
      outputs_delivered: { schedule: 'pdf' },
      delivery_time: '24 hours',
      hosting_method: 'native',
      hosting_url: 'https://nyxa.vercel.app',
      status: 'active'
    },
    {
      provider_id: providerId,
      title: 'Competitor Analysis Dashboard',
      description: 'Automated scrape and synthesis of your top 5 competitors pricing, features, and sentiment.',
      price: 200,
      class: 'Business',
      kind: 'Competitor Analysis',
      dubs: ['}business', '}competitor', '}data'],
      inputs_required: { competitors: 'array' },
      outputs_delivered: { dashboardUrl: 'string' },
      delivery_time: '2 days',
      hosting_method: 'native',
      hosting_url: 'https://nyxa.vercel.app',
      status: 'active'
    },
    {
      provider_id: providerId,
      title: 'Course Notes Summarizer',
      description: 'Upload your lecture transcripts or raw notes and get a perfectly formatted, highlighted summary.',
      price: 15,
      class: 'Education',
      kind: 'Notes Summaries',
      dubs: ['}education', '}summary', '}notes'],
      inputs_required: { document: 'file' },
      outputs_delivered: { summary: 'pdf' },
      delivery_time: '2 hours',
      hosting_method: 'native',
      hosting_url: 'https://nyxa.vercel.app',
      status: 'active'
    },
    {
      provider_id: providerId,
      title: 'Automated Quiz Generation',
      description: 'Turn any textbook chapter or syllabus into a 50-question multiple choice quiz with answer keys.',
      price: 30,
      class: 'Education',
      kind: 'Quiz Generation',
      dubs: ['}quiz', '}education', '}assessment'],
      inputs_required: { content: 'file', difficulty: 'string' },
      outputs_delivered: { quiz: 'pdf', answers: 'pdf' },
      delivery_time: '4 hours',
      hosting_method: 'native',
      hosting_url: 'https://nyxa.vercel.app',
      status: 'active'
    }
  ];

  console.log('Posting tasks to Nyxa API...');
  for (const task of tasks) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(task)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to post task "${task.title}":`, res.status, errorText);
      } else {
        const data = await res.json();
        console.log(`Successfully posted task: ${task.title}`);
      }
    } catch (e) {
      console.error(`Error posting task "${task.title}":`, e);
    }
  }
  
  console.log('Seeding complete.');
}

seed();
