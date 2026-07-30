import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, price, category, tags, inputs, outputs, code } = body;

    // Schema Validation
    if (!id || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required manifest fields: `id`, `title`, and `description` are required.' },
        { status: 400 }
      );
    }

    const slug = id.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Construct Published Task Record
    const publishedTask = {
      id: slug,
      provider_id: '00000000-0000-0000-0000-000000000000',
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      class: category || 'Utility',
      kind: title.trim(),
      dubs: Array.isArray(tags) ? tags : [slug, 'sdk'],
      inputs_required: inputs || {},
      outputs_delivered: outputs || {},
      delivery_time: 'Instant',
      hosting_method: 'native',
      hosting_url: `https://nyxa.app/tasks/${slug}`,
      status: 'active',
      published_via: '@nyxa/sdk v1.0.0',
      published_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: `Task "${title}" successfully validated and registered via @nyxa/sdk!`,
        task: publishedTask,
        cli_command: `npx nyxa publish --id ${slug}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'SDK Publish Failed' },
      { status: 500 }
    );
  }
}
